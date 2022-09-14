import { io } from "socket.io-client";
import comm from "./comm.js";

class Client {

    money = 0;

    socket = io(window.location.hostname + ":3001");

    constructor() {
        this.socket.on("connect_error", () => {
            console.error("Couldn't connect!");
            this.socket.disconnect();
        })

        this.socket.on("connect", () => {
            setTimeout(() => this.onConnect(), 1000);
        })
    }

    onConnect() {

    }

    /**
     * @param {string} name
     * @return {Promise<boolean>}
     */
     async addPlayer(name) {
        return new Promise(resolve => {
            this.socket.emit(comm.ADD_PLAYER, name, (response) => {
                resolve(response);
            });
        })
    }
}

export default Client;
