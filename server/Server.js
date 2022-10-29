import * as fs from "fs";
import { Server as SocketServer } from "socket.io";
import ip from "ip"
import comm from "../src/comm.js";
import Player from "./Player.js";
import Bank from "./Bank.js";
import Vote from "./Vote.js";
import {startingAmount} from "../src/config.js";

const savedPath = "./saved.json";

class Server {

    port = 3001;

    server = new SocketServer({cors: {origin: ["http://localhost:3000", `http://${ip.address()}:3000`]}});

    /**
     * @type {Map<string, Player>}
     */
    players = new Map([["Bank", new Bank()]]);

    /**
     * All transactions that happened.
     * @type {{from: string, to: string, amount: number}[]}
     */
    transactions = [];

    /**
     * @type {Map<number, Vote>}
     */
    votesInProgress = new Map();

    constructor() {
        if (fs.existsSync(savedPath)) {
            this.transactions = JSON.parse(fs.readFileSync(savedPath).toString());
        }

        this.server.on("connection", (socket) => {
            console.log(`[Socket connected: ${socket.handshake.address}]`);

            socket.on(comm.ADD_PLAYER, (name, respond) => {
                const result = this.addPlayer(name, socket);
                respond(result);
                if (result) {
                    const player = this.players.get(name);
                    console.log(`Connected: ${player.name} (ip: ${player.socket.handshake.address}). Connected players: ${this.getConnectedHumanPlayersString()}.`);
                    setTimeout(() => {
                        player.sendTransactions(this.transactions);
                        for (const [id, vote] of this.votesInProgress.entries()) {
                            if (!vote.hasVoted(name)) {
                                player.emit(comm.START_VOTE, {id, amount: vote.amount, recipient: vote.recipient});
                            }
                        }
                    }, 200);
                }

                socket.on(comm.VOTE, ({id, vote}) => {
                    this.playerVoted(name, id, vote);
                });
            });

            socket.on("disconnect", (reason) => {
                const leaver = [...this.players.values()].find(p => p.socket === socket);
                if (!leaver) {
                    console.log(`[Socket disconnected, reason: ${reason}]`)
                    return;
                }
                leaver.setConnected(false);
                console.log(`Disconnected: ${leaver.name} (ip: ${leaver.socket.handshake.address}). Connected players: ${this.getConnectedHumanPlayersString()}.`);
            });

            socket.on(comm.REQUEST_UPDATE_TRANSACTIONS, (name) => {
                this.players.get(name).sendTransactions(this.transactions);
            });

            socket.on(comm.TRANSFER, ({ amount, from, to }) => {
                this.transfer(from, to, amount);
            });
        });

        this.server.listen(this.port);
        console.log("Server started");
    }

    /**
     * @param {string} name
     * @param {Socket} socket
     * @return {boolean}
     */
    addPlayer(name, socket) {
        if (this.players.has(name) && this.players.get(name).isConnected()) {
            return false;
        } else if (this.players.has(name)) {
            this.players.get(name).setConnected(true);
            this.players.get(name).socket = socket;
        } else if (!/^[a-z A-Z]+$/.test(name)) {
            socket.emit(comm.ERROR, "Chosen name contains invalid characters!");
            return false;
        } else if (this.playerExistsInTransactions(name)) {
            this.players.set(name, new Player(name, socket, this.getMoneyFromTransactions(name)));
        } else {
            this.players.set(name, new Player(name, socket, startingAmount));
            this.actualTransfer("Bank", name, startingAmount);
        }
        return true;
    }

    /**
     *
     * @param {string} name
     * @return {boolean}
     */
    playerExistsInTransactions(name) {
        return this.transactions.some(t => t.to === name);
    }

    /**
     *
     * @param {string} playerName
     * @return {number}
     */
    getMoneyFromTransactions(playerName) {
        return this.transactions.reduce((money, currentTransaction) => {
            if (currentTransaction.to === playerName) {
                return money + currentTransaction.amount;
            } else if (currentTransaction.from === playerName) {
                return money - currentTransaction.amount;
            } else {
                return money;
            }
        }, 0)
    }

    /**
     * @param {string} from
     * @param {string} to
     * @param {number} amount
     */
    addTransaction(from, to, amount) {
        this.transactions.push({from, to, amount});
        fs.writeFile(savedPath, JSON.stringify(this.transactions, null, 2), (err) => {
            if (err) {
                console.error(err);
            }
        });
    }

    /**
     * @param {string} from
     * @param {string} to
     * @param {number} amount
     */
    transfer(from, to, amount) {
        if (!this.players.has(from)) {
            return;
        }
        if (!this.players.has(to)) {
            this.players.get(from).emit(comm.ERROR, "This player has not (yet) been connected!");
            return;
        }
        if (!this.players.get(from).canReduceMoneyBy(amount)) {
            this.players.get(from).emit(comm.ERROR, "Not enough money!");
            return;
        }
        if (from === "Bank") {
            this.startVote(amount, to);
            return;
        }
        this.actualTransfer(from, to, amount);
    }

    /**
     * @param {string} from
     * @param {string} to
     * @param {number} amount
     */
    actualTransfer(from, to, amount) {
        const payer = this.players.get(from);
        const payee = this.players.get(to);
        payer.reduceMoneyBy(amount);
        payee.increaseMoneyBy(amount);
        this.addTransaction(from, to, amount);
        for (const player of this.players.values()) {
            player.sendTransfer({from, to, amount});
        }
    }

    /**
     * @param {number} amount
     * @param {string} recipient
     */
    startVote(amount, recipient) {
        if (this.getHumanPlayersAmount() === 1) {
            this.actualTransfer("Bank", recipient, amount);
            return;
        }
        const id = Math.round(Math.random() * Number.MAX_SAFE_INTEGER);
        this.votesInProgress.set(id, new Vote(amount, recipient));
        for (const player of this.players.values()) {
            player.emit(comm.START_VOTE, {id, amount, recipient});
        }
        setTimeout(() => this.endVote(id), 20 * 1000);
        console.log(`Started vote ${id}: ${recipient} gets ${amount}`);
    }

    /**
     * @param {number} id
     */
    endVote(id) {
        if (!this.votesInProgress.has(id)) {
            return;
        }
        for (const player of this.players.values()) {
            player.emit(comm.END_VOTE, id);
        }
        const onGoingVote = this.votesInProgress.get(id);
        if (onGoingVote.result()) {
            this.actualTransfer("Bank", onGoingVote.recipient, onGoingVote.amount);
        }
        this.votesInProgress.delete(id);
        console.log("Ended vote", id);
    }

    /**
     *
     * @param {string} voter
     * @param {number} id
     * @param {boolean} vote
     */
    playerVoted(voter, id, vote) {
        if (!this.votesInProgress.has(id)) {
            return;
        }
        const onGoingVote = this.votesInProgress.get(id);
        onGoingVote.vote(vote, voter);
        console.log(voter, "voted", vote, "in vote", id);
        if (onGoingVote.totalVotes() === this.getHumanPlayersAmount() - 1) {
            this.endVote(id);
        }
    }

    /**
     * Excluding bank
     * @return {number}
     */
    getHumanPlayersAmount() {
        return [...this.players.values()].filter(p => p.name !== "Bank").length;
    }

    getConnectedHumanPlayersString() {
        return [...this.players.keys()].filter(n => n !== "Bank" && this.players.get(n).isConnected()).join(", ");
    }

}

new Server();
