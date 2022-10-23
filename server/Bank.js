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

    sendTransactions(transactions) {

    }

    sendTransfer(transfer) {

    }

    emit(event, args, ack = undefined) {

    }
}

export default Bank;
