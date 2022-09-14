import comm from "../src/comm.js";
import startingAmount from "../src/startingAmount.js";

class Player {

    money = startingAmount;

    connected = true;

    /**
     * @type {Socket}
     */
    socket;

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
        this.socket.emit(comm.UPDATE_MONEY, this.money);
    }

    updatePlayers(players) {
        this.socket.emit(comm.UPDATE_PLAYERS, players);
    }

    emit(event, args, ack = undefined) {
        this.socket.emit(event, args, ack);
    }
}

export default Player;
