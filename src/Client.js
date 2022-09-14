import { io } from "socket.io-client";

class Client {

    money = 0;

    socket = io(window.location.hostname + ":3001");

    constructor() {
        this.socket.on("connect_error", () => {
            console.error("Couldn't connect!");
            this.socket.disconnect();
        })
    }
}

export default Client;
