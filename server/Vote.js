class Vote {

    yea = 0;

    nay = 0;

    /**
     * @type {number}
     */
    amount;

    /**
     * @type {string}
     */
    recipient;

    constructor(amount, recipient) {
        this.amount = amount;
        this.recipient = recipient;
    }

    /**
     * @param {boolean} bool
     */
    vote(bool) {
        if (bool) {
            this.yea++;
        } else {
            this.nay++;
        }
    }

    result() {
        return this.nay <= 1 && this.yea > this.nay;
    }

    totalVotes() {
        return this.yea + this.nay;
    }
}

export default Vote;
