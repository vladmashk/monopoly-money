
class Player {

    money = 0;

    connected = true;

    constructor(money) {
        this.money = money;
    }

    isConnected() {
        return this.connected;
    }

    setConnected(connected) {
        this.connected = connected;
    }
}

export default Player;
