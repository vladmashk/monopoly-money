import Player from "./Player.js";

class Bank extends Player {

    constructor() {
        super("Bank", 0);
    }

    canReduceMoneyBy(amount) {
        return true;
    }

    increaseMoneyBy(amount) {

    }

    reduceMoneyBy(amount) {

    }

    updateState(state) {

    }

    sendNotification(from, amount) {

    }

    emit(event, args, ack = undefined) {

    }
}

export default Bank;
