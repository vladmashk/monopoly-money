const comm = { // client <--> server
    ADD_PLAYER: "add-player", // string (name) -->
    UPDATE_STATE: "update-state", // {[key: string]: number} <--
    REQUEST_UPDATE_STATE: "request-update-state", // none -->
    TRANSFER: "transfer", // {amount: number, from: string, to: string} -->
    START_VOTE: "start-vote", // {id: number, recipient: string, amount: string} <--
    END_VOTE: "end-vote", // number (id) <--
    VOTE: "vote", // {id: number, vote: boolean} <--
    ERROR: "error", // string (reason) <--
    NOTIFICATION: "notification", // {from: string, amount: string} <--
}

export default comm;
