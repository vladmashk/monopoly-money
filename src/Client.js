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
     *
     * @type {{from: string, to: string, amount: number}[]}
     */
    transactions = [];

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
            this.reconnectAttempts = 0;
            this.setConnected(true);
            console.log("Connected to server!");
            if (this.name) {
                this.addPlayer(this.name);
            }
        });

        this.socket.on("disconnect", () => {
            this.setConnected(false);
        });

        this.socket.on(comm.UPDATE_TRANSACTIONS, (transactions) => this.setTransactions(transactions));

        this.socket.on(comm.TRANSFER, ({from, to, amount}) => {
            this.addTransaction(from, to, amount);
            this.players.set(from, this.players.get(from) ? this.players.get(from) - amount : -amount);
            this.players.set(to, this.players.get(to) ? this.players.get(to) + amount : amount);
            this.money = this.players.get(this.name);
            this.updateMoney(this.money);
            this.updateState(this.getState());
            if (to === this.name) {
                this.addNotification(from, amount);
            }
        })

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
        this.socket.emit(comm.REQUEST_UPDATE_TRANSACTIONS, this.name);
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
     * @return {{[name: string]: number}}
     */
    getState() {
        let state = Object.fromEntries(this.players);
        delete state[this.name];
        return state;
    }

    /**
     * @param {{from: string, to: string, amount: number}[]} transactions
     */
    setTransactions(transactions) {
        this.transactions = transactions;
        this.setPlayersBasedOnTransactions();
        this.money = this.players.get(this.name);
        this.updateMoney(this.money);
        this.updateState(this.getState());
        this.updateTransactions(this.transactions);
    }

    /**
     * @param {string} from
     * @param {string} to
     * @param {number} amount
     */
    addTransaction(from, to, amount) {
        this.transactions.push({from, to, amount});
        this.updateTransactions(this.transactions);
    }

    setPlayersBasedOnTransactions() {
        let players = new Map();
        for (const t of this.transactions) {
            players.set(t.from, players.get(t.from) ? players.get(t.from) - t.amount : -t.amount);
            players.set(t.to, players.get(t.to) ? players.get(t.to) + t.amount : t.amount);
        }
        this.players = players;
    }

    /**
     * @param {boolean} connected
     */
    setConnected(connected) {
        this.connected = connected;
        this.updateConnected(connected);
    }

    /**
     * @param {number} money
     */
    updateMoney(money) {}

    /**
     * @param {{[name: string]: number}} state
     */
    updateState(state) {}

    /**
     * @param {{from: string, to: string, amount: number}[]} transactions
     */
    updateTransactions(transactions) {}

    /**
     * @param {boolean} connected
     */
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
