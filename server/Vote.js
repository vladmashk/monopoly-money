class Vote {

    yea = 0;

    nay = 0;

    /**
     * @type {number}
     */
    amount;

    /**
     * Players who have already voted.
     * @type {Set<string>}
     */
    voted = new Set();

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
     * @param {string} name
     */
    vote(bool, name) {
        if (bool) {
            this.yea++;
        } else {
            this.nay++;
        }
        this.voted.add(name);
    }

    /**
     * @param {string} player
     * @return {boolean}
     */
    hasVoted(player) {
        return this.voted.has(player);
    }

    result() {
        return this.nay <= 1 && this.yea > this.nay;
    }

    totalVotes() {
        return this.yea + this.nay;
    }
}

export default Vote;
