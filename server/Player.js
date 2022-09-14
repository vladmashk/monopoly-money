
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
}

export default Player;
