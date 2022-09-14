import { io } from "socket.io-client";
import comm from "./comm.js";

class Client {

    /**
     * @type {string}
     */
    name;

    money = 0;

    socket = io(window.location.hostname + ":3001");

    /**
     * @type {string[]}
     */
    players = [];

    constructor() {
        this.socket.on("connect_error", () => {
            console.error("Couldn't connect!");
            this.socket.disconnect();
        })

        this.socket.on(comm.UPDATE_MONEY, (money) => this.setMoney(money));

        this.socket.on(comm.UPDATE_PLAYERS, (players) => this.setPlayers(players));

        this.socket.on(comm.START_VOTE, ({id, recipient, amount}) => {
            if (recipient !== this.name) {
                this.startVote(id, recipient, amount);
            }
        });

        this.socket.on(comm.END_VOTE, (id) => {
            this.endVote(id);
        });
    }

    /**
     * @return {string[]}
     */
    getOtherPlayers() {
        return this.players.filter(p => p !== this.name);
    }

    /**
     * @param {string} name
     * @return {Promise<boolean>}
     */
     async addPlayer(name) {
        return new Promise(resolve => {
            this.socket.emit(comm.ADD_PLAYER, name, (response) => {
                if (response) {
                    this.name = name;
                }
                resolve(response);
            });
        })
    }

    /**
     * @param {number} amount
     * @param {string} recipient
     * @return {boolean}
     */
    transferTo(amount, recipient) {
        if (this.money - amount < 0 || !this.players.includes(recipient)) {
            return false;
        }
        this.socket.emit(comm.TRANSFER, {amount: amount, from: this.name, to: recipient});
        return true;
    }

    transferFromBank(amount) {
        this.socket.emit(comm.TRANSFER, {amount: amount, from: "Bank", to: this.name});
    }

    /**
     *
     * @param {number} id
     * @param {boolean} vote
     */
    playerVote(id, vote) {
        this.socket.emit(comm.VOTE, {id, vote});
    }

    /**
     * @param {number} money
     */
    setMoney(money) {
        this.money = money;
        this.updateMoney(money);
    }

    setPlayers(players) {
        this.players = players;
        this.updatePlayers(this.getOtherPlayers());
    }

    /**
     * @param {number} money
     */
    updateMoney(money) {}

    updatePlayers(players) {}

    /**
     *
     * @param {number} id
     * @param {string} recipient
     * @param {number} amount
     */
    startVote(id, recipient, amount) {}

    /**
     *
     * @param {number} id
     */
    endVote(id) {}
}

export default Client;
