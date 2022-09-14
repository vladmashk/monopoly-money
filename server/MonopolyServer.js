import { Server } from "socket.io";
import ip from "ip"
import comm from "../src/comm.js";
import Player from "./Player.js";
import startingAmount from "../src/startingAmount.js";

class MonopolyServer {

    port = 3001;

    server = new Server({cors: {origin: ["http://localhost:3000", `http://${ip.address()}:3000`]}});

    static initialAmount = startingAmount;

    /**
     * @type {Map<string, Player>}
     */
    players = new Map([["Bank", new Player(Math.floor(Number.MAX_SAFE_INTEGER / 2), true)]]);

    constructor() {
        this.server.on("connection", (socket) => {
            console.log("Client connected:", socket.id, socket.handshake.address);

            socket.on(comm.ADD_PLAYER, (name, respond) => {
                const result = this.addPlayer(name);
                if (result) {
                    const player = this.players.get(name);
                    socket.emit(comm.UPDATE_MONEY, player.money);
                    player.socket = socket;
                    for (const player of this.players.values()) {
                        player.updatePlayers(this.getPlayerNames());
                    }
                }
                respond(result);
            });

            socket.on("disconnect", () => {
                const leaver = [...this.players.values()].find(p => p.socket === socket);
                if (!leaver) {
                    return;
                }
                leaver.setConnected(false);
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
        return [...this.players.keys()];
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
            this.players.set(name, new Player(MonopolyServer.initialAmount));
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
        const payer = this.players.get(from);
        const payee = this.players.get(to);
        payer.reduceMoneyBy(amount);
        payer.updateMoney()
        payee.increaseMoneyBy(amount);
        payee.updateMoney();
    }

}

new MonopolyServer();
