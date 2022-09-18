const comm = {
    ADD_PLAYER: "add-player",
    UPDATE_MONEY: "update-money",
    REQUEST_UPDATE_MONEY: "request-update-money",
    UPDATE_PLAYERS: "update-players",
    TRANSFER: "transfer",
    START_VOTE: "start-vote", // {id: number, recipient: string, amount: string}
    END_VOTE: "end-vote", // number (id)
    VOTE: "vote" // {id: number, vote: boolean}
}

export default comm;
