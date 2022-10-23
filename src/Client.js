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

    connected = true;

    reconnectAttempts = 0;

    constructor() {
        this.socket.on("connect_error", () => {
            this.setConnected(false);
            this.reconnectAttempts++;
            if (this.reconnectAttempts > 25) {
                this.socket.disconnect();
            }
        });

        this.socket.on("connect", () => {
            this.setConnected(true);
            console.log("Connected to server!");
            if (this.name) {
                this.addPlayer(this.name);
            }
        });

        this.socket.on("disconnect", () => {
            this.setConnected(false);
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

        this.socket.on(comm.ERROR, (error) => {
            this.addError(error);
        });

        this.socket.on(comm.NOTIFICATION, ({from, amount}) => {
            this.addNotification(from, amount);
        })
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
        this.socket.emit(comm.TRANSFER, {amount: amount, from: this.name, to: recipient});
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

    getState() {
        let state = Object.fromEntries(this.players);
        delete state[this.name];
        return state;
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
        this.updateState();
    }

    setConnected(connected) {
        this.connected = connected;
        this.updateConnected(connected);
    }

    /**
     * @param {number} money
     */
    updateMoney(money) {}

    updateState() {}

    updateConnected(connected) {}

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

    /**
     * @param {string} errorMessage
     */
    addError(errorMessage) {}

    /**
     * @param {string} from
     * @param {number} amount
     */
    addNotification(from, amount) {}

}

export default Client;
