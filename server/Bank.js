import Player from "./Player.js";

class Bank extends Player {

    name = "Bank";

    canReduceMoneyBy(amount) {
        return true;
    }

    increaseMoneyBy(amount) {

    }

    reduceMoneyBy(amount) {

    }

    updateMoney() {

    }

    updatePlayers(players) {

    }

    emit(event, args, ack = undefined) {

    }
}

export default Bank;
