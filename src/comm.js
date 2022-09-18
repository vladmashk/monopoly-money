const comm = {
    ADD_PLAYER: "add-player",
    UPDATE_STATE: "update-state",
    REQUEST_UPDATE_STATE: "request-update-state",
    TRANSFER: "transfer",
    START_VOTE: "start-vote", // {id: number, recipient: string, amount: string}
    END_VOTE: "end-vote", // number (id)
    VOTE: "vote" // {id: number, vote: boolean}
}

export default comm;
