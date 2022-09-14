import { Server } from "socket.io";
import ip from "ip"
import comm from "../src/comm.js";
import Player from "./Player.js";
import Bank from "./Bank.js";
import Vote from "./Vote.js";

class MonopolyServer {

    port = 3001;

    server = new Server({cors: {origin: ["http://localhost:3000", `http://${ip.address()}:3000`]}});

    /**
     * @type {Map<string, Player>}
     */
    players = new Map([["Bank", new Bank()]]);

    /**
     * @type {Map<number, Vote>}
     */
    votesInProgress = new Map();

    constructor() {
        this.server.on("connection", (socket) => {
            console.log("Client connected:", socket.id, socket.handshake.address);

            socket.on(comm.ADD_PLAYER, (name, respond) => {
                const result = this.addPlayer(name);
                if (result) {
                    const player = this.players.get(name);
                    socket.emit(comm.UPDATE_MONEY, player.money);
                    player.socket = socket;
                    this.updatePlayers();
                }
                respond(result);

                socket.on(comm.VOTE, ({id, vote}) => {
                    this.playerVoted(name, id, vote);
                })
            });

            socket.on("disconnect", () => {
                const leaver = [...this.players.values()].find(p => p.socket === socket);
                if (!leaver) {
                    return;
                }
                leaver.setConnected(false);
                this.updatePlayers();
            });

            socket.on(comm.TRANSFER, ({ amount, from, to }) => {
                this.transfer(amount, from, to);
            });
        });

        this.server.listen(this.port);
        console.log("Server started");
    }

    /**
     * @return {string[]}
     */
    getPlayerNames() {
        return [...this.players.keys()].filter(n => this.players.get(n).isConnected());
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
        } else {
            this.players.set(name, new Player());
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
        payer.updateMoney()
        payee.increaseMoneyBy(amount);
        payee.updateMoney();
    }

    /**
     * @param {number} amount
     * @param {string} recipient
     */
    startVote(amount, recipient) {
        const id = Math.round(Math.random() * Number.MAX_SAFE_INTEGER);
        this.votesInProgress.set(id, new Vote(amount, recipient));
        for (const player of this.players.values()) {
            player.emit(comm.START_VOTE, {id, amount, recipient});
        }
        setTimeout(() => this.endVote(id), 20 * 1000);
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
        if (onGoingVote.totalVotes() === this.getActivePlayersAmount() - 2) {
            this.endVote(id);
        }
    }

    getActivePlayersAmount() {
        return [...this.players.values()].filter(p => p.isConnected()).length;
    }

    updatePlayers() {
        for (const player of this.players.values()) {
            player.updatePlayers(this.getPlayerNames());
        }
    }
}

new MonopolyServer();
