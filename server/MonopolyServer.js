import { Server } from "socket.io";
import ip from "ip"
import comm from "../src/comm.js";
import Player from "./Player.js";

class MonopolyServer {

    port = 3001;

    server = new Server({cors: {origin: ["http://localhost:3000", `http://${ip.address()}:3000`]}});

    static initialAmount = 1000;

    /**
     * @type {Map<string, Player>}
     */
    players = new Map([["Bank", new Player(Math.floor(Number.MAX_SAFE_INTEGER / 2))]]);

    constructor() {
        this.server.on("connection", (socket) => {
            console.log("Client connected:", socket.id, socket.handshake.address);

            socket.on(comm.ADD_PLAYER, (name, respond) => {
                respond(this.addPlayer(name));
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
        console.log("Add player", name);
        if (this.players.has(name) && this.players.get(name).isConnected()) {
            return false;
        } else if (this.players.has(name)) {
            this.players.get(name).setConnected(true);
        } else {
            this.players.set(name, new Player(MonopolyServer.initialAmount));
        }
        return true;
    }

}

new MonopolyServer();
