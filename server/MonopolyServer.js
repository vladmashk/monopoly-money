import { Server } from "socket.io";
import ip from "ip"

class MonopolyServer {

    port = 3001;

    server = new Server({cors: {origin: ["http://localhost:3000", `http://${ip.address()}:3000`]}});

    constructor() {
        this.server.on("connection", (socket) => {
            console.log("Client connected:", socket.id, socket.handshake.address);
        });

        this.server.listen(this.port);
        console.log("Server started")
    }
}

new MonopolyServer();
