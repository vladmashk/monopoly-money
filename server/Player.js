import comm from "../src/comm.js";

class Player {

    money = 0;

    connected = true;

    /**
     * @type {Socket}
     */
    socket;

    isBank = false;

    constructor(money, isBank = false) {
        this.money = money;
        this.isBank = isBank;
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

    updateMoney() {
        if (!this.isBank) {
            this.socket.emit(comm.UPDATE_MONEY, this.money);
        }
    }

    updatePlayers(players) {
        if (!this.isBank) {
            this.socket.emit(comm.UPDATE_PLAYERS, players);
        }
    }
}

export default Player;
