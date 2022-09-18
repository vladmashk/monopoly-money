import comm from "../src/comm.js";
import startingAmount from "../src/startingAmount.js";

class Player {

    /**
     * @type {string}
     */
    name;

    money = 0;

    connected = true;

    /**
     * @type {Socket}
     */
    socket;

    constructor(name, money = startingAmount) {
        this.name = name;
        this.money = money;
    }

    isConnected() {
        return this.connected;
    }

    setConnected(connected) {
        this.connected = connected;
    }

    canReduceMoneyBy(amount) {
        return this.money - amount >= 0;
    }

    increaseMoneyBy(amount) {
        this.money += amount;
    }

    reduceMoneyBy(amount) {
        this.money -= amount;
    }

    /**
     * @param {Object} state
     */
    updateState(state) {
        this.socket.emit(comm.UPDATE_STATE, state);
    }

    emit(event, args, ack = undefined) {
        this.socket.emit(event, args, ack);
    }
}

export default Player;
