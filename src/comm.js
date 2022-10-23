const comm = { // client <--> server
    ADD_PLAYER: "add-player", // string (name) -->
    UPDATE_TRANSACTIONS: "update-transactions", // {from: string, to: string, amount: number}[] <--
    REQUEST_UPDATE_TRANSACTIONS: "request-update-transactions", // string (name of requester) -->
    TRANSFER: "transfer", // {amount: number, from: string, to: string} <<-->
    START_VOTE: "start-vote", // {id: number, recipient: string, amount: string} <--
    END_VOTE: "end-vote", // number (id) <--
    VOTE: "vote", // {id: number, vote: boolean} <--
    ERROR: "error", // string (reason) <--
}

export default comm;
