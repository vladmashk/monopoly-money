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
     * @type {Map<string, number>}
     */
    players = new Map();

    /**
     * Other player state
     * @type {Object}
     */
    state = {};

    constructor() {
        this.socket.on("connect_error", () => {
            console.error("Couldn't connect!");
            this.socket.disconnect();
        });

        this.socket.on("connect", () => {
            console.log("Connected to server!");
        });

        this.socket.on(comm.UPDATE_STATE, (state) => this.setState(state));

        this.socket.on(comm.START_VOTE, ({id, recipient, amount}) => {
            if (recipient !== this.name) {
                this.startVote(id, recipient, amount);
            }
        });

        this.socket.on(comm.END_VOTE, (id) => {
            this.endVote(id);
        });
    }

    getState() {
        return this.state;
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
        if (this.money - amount < 0 || !this.players.has(recipient)) {
            return false;
        }
        this.socket.emit(comm.TRANSFER, {amount: amount, from: this.name, to: recipient});
        return true;
    }

    transferFromBank(amount) {
        this.socket.emit(comm.TRANSFER, {amount: amount, from: "Bank", to: this.name});
    }

    requestUpdateMoney() {
        this.socket.emit(comm.REQUEST_UPDATE_STATE);
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
     * @param {Object} state is {name1: money1, name2: money2, ...}
     */
    setState(state) {
        this.money = state[this.name];
        for (const [name, money] of Object.entries(state)) {
            this.players.set(name, money);
        }
        this.updateMoney(this.money);
        delete state[this.name];
        this.state = state;
        this.updateState(state);
    }

    /**
     * @param {number} money
     */
    updateMoney(money) {}

    updateState(state) {}

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
