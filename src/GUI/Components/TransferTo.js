import {client} from "../../index.js";
import {useEffect, useState} from "react";
import "./TransferTo.css";

function TransferTo() {

    const [otherPlayers, setOtherPlayers] = useState(client.getOtherPlayers());

    const [recipient, setRecipient] = useState("Bank");

    const [transferAmount, setTransferAmount] = useState("");

    const [error, setError] = useState("");

    useEffect(() => {
        client.updatePlayers = updatePlayers;
    }, []);

    function updatePlayers(players) {
        setOtherPlayers(p => players);
    }

    function showError(text) {
        setError(text);
        setTimeout(() => setError(""), 1000);
    }

    function transfer() {
        setError("");
        if (transferAmount === "" || transferAmount.includes(".")) {
            showError("Invalid amount");
            return;
        }
        const amount = parseInt(transferAmount);
        if (isNaN(amount) || amount <= 0) {
            showError("Invalid amount");
            return;
        }
        if (!client.transferTo(amount, recipient)) {
            showError("Transfer failed");
            return;
        }
        setTransferAmount("");
    }

    return (
        <div className="box">
            <div>
                <label id="recipientLabel" htmlFor="recipientSelect"><b>Transfer to</b></label>
                <select id="recipientSelect" onChange={e => setRecipient(e.target.value)} defaultValue={"Bank"}>
                    {otherPlayers.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>
            <input id="transferToAmount"
                   className="amountInput"
                   type="number"
                   min={1}
                   placeholder="Enter amount to transfer"
                   value={transferAmount}
                   onChange={e => setTransferAmount(e.target.value)}/>
            <button onClick={() => transfer()}>Transfer</button>
            {error && <span className="error">{error}</span>}
        </div>
    );
}

TransferTo.propTypes = {

};

export default TransferTo;
