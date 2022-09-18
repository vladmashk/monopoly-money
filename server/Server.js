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
            console.log("Client connected:", socket.id, socket.handshake.address);

            socket.on(comm.ADD_PLAYER, (name, respond) => {
                const result = this.addPlayer(name);
                respond(result);
                if (result) {
                    const player = this.players.get(name);
                    player.socket = socket;
                    setTimeout(() => {
                        this.updateState();
                    }, 100);
                }

                socket.on(comm.VOTE, ({id, vote}) => {
                    this.playerVoted(name, id, vote);
                });
            });

            socket.on("disconnect", () => {
                const leaver = [...this.players.values()].find(p => p.socket === socket);
                if (!leaver) {
                    return;
                }
                leaver.setConnected(false);
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
     * @return {boolean}
     */
    addPlayer(name) {
        if (this.players.has(name) && this.players.get(name).isConnected()) {
            return false;
        } else if (this.players.has(name)) {
            this.players.get(name).setConnected(true);
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
        if (!this.players.has(from) || !this.players.has(from) || !this.players.get(from).canReduceMoneyBy(amount)) {
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
        console.log("Started vote", id);
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
    getActiveState() {
        let activeState = {};
        for (const player of this.players.values()) {
            if (player.isConnected()) {
                activeState[player.name] = player.money;
            }
        }
        return activeState;
    }

    updateState() {
        for (const player of this.players.values()) {
            if (player.name === "Bank")
                continue;
            player.updateState(this.getActiveState());
            this.savedState[player.name] = player.money;
        }
        fs.writeFile(savedPath, JSON.stringify(this.savedState, null, 2), (err) => {
            if (err) {
                console.log(err);
            }
        });
    }
}

new Server();
