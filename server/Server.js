import * as fs from "fs";
import { Server as SocketServer } from "socket.io";
import ip from "ip"
import comm from "../src/comm.js";
import Player from "./Player.js";
import Bank from "./Bank.js";
import Vote from "./Vote.js";

const savedPath = "./saved.json";

class Server {

    port = 3001;

    server = new SocketServer({cors: {origin: ["http://localhost:3000", `http://${ip.address()}:3000`]}});

    /**
     * @type {Map<string, Player>}
     */
    players = new Map([["Bank", new Bank()]]);

    /**
     * @type {Map<number, Vote>}
     */
    votesInProgress = new Map();

    /**
     * @type {object}
     */
    savedState = {};

    constructor() {
        if (fs.existsSync(savedPath)) {
            this.savedState = JSON.parse(fs.readFileSync(savedPath).toString());
        }

        this.server.on("connection", (socket) => {
            //const possiblePlayer = [...this.players.values()].find(p => p.socket.handsha)
            console.log(`[Socket connected: ${socket.handshake.address}]`);

            socket.on(comm.ADD_PLAYER, (name, respond) => {
                const result = this.addPlayer(name, socket);
                respond(result);
                if (result) {
                    const player = this.players.get(name);
                    player.socket = socket;
                    console.log(`Connected: ${player.name} (ip: ${player.socket.handshake.address}). Connected players: ${this.getConnectedHumanPlayersString()}.`);
                    setTimeout(() => {
                        this.updateState();
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
                this.updateState();
            });

            socket.on(comm.REQUEST_UPDATE_STATE, () => {
                this.updateState();
            });

            socket.on(comm.TRANSFER, ({ amount, from, to }) => {
                this.transfer(amount, from, to);
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
        } else if (!/^[a-zA-Z]+$/.test(name)) {
            socket.emit(comm.ERROR, "Chosen name contains invalid characters!");
            return false;
        } else if (this.savedState[name]) {
            this.players.set(name, new Player(name, this.savedState[name]));
        } else {
            this.players.set(name, new Player(name));
        }
        return true;
    }

    /**
     * @param {number} amount
     * @param {string} from
     * @param {string} to
     */
    transfer(amount, from, to) {
        if (!this.players.has(from) || !this.players.has(from)) {
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
        this.actualTransfer(amount, from, to);
    }

    /**
     * @param {number} amount
     * @param {string} from
     * @param {string} to
     */
    actualTransfer(amount, from, to) {
        const payer = this.players.get(from);
        const payee = this.players.get(to);
        payer.reduceMoneyBy(amount);
        payee.increaseMoneyBy(amount);
        this.updateState();
    }

    /**
     * @param {number} amount
     * @param {string} recipient
     */
    startVote(amount, recipient) {
        if (this.getActivePlayersAmount() === 1) {
            this.actualTransfer(amount, "Bank", recipient);
            return;
        }
        const id = Math.round(Math.random() * Number.MAX_SAFE_INTEGER);
        this.votesInProgress.set(id, new Vote(amount, recipient));
        for (const player of this.players.values()) {
            player.emit(comm.START_VOTE, {id, amount, recipient});
        }
        setTimeout(() => this.endVote(id), 15 * 1000);
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
            this.actualTransfer(onGoingVote.amount, "Bank", onGoingVote.recipient);
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
        onGoingVote.vote(vote);
        console.log(voter, "voted", vote, "in vote", id);
        if (onGoingVote.totalVotes() === this.getActivePlayersAmount() - 1) {
            this.endVote(id);
        }
    }

    /**
     * Excluding bank
     * @return {number}
     */
    getActivePlayersAmount() {
        return [...this.players.values()].filter(p => p.isConnected() && p.name !== "Bank").length;
    }

    /**
     * @return {Object}
     */
    getState() {
        let state = {};
        for (const player of this.players.values()) {
                state[player.name] = player.money;
        }
        return state;
    }

    updateState() {
        for (const player of this.players.values()) {
            if (player.name === "Bank")
                continue;
            player.updateState(this.getState());
            this.savedState[player.name] = player.money;
        }
        fs.writeFile(savedPath, JSON.stringify(this.savedState, null, 2), (err) => {
            if (err) {
                console.log(err);
            }
        });
    }

    getConnectedHumanPlayersString() {
        return [...this.players.keys()].filter(n => n !== "Bank" && this.players.get(n).isConnected()).join(", ");
    }
}

new Server();
