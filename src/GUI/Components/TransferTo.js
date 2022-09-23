import {client} from "../../index.js";
import {useState} from "react";
import "./TransferTo.css";
import PropTypes from "prop-types";

function TransferTo(props) {

    const [recipient, setRecipient] = useState("Bank");

    const [transferAmount, setTransferAmount] = useState("");

    const [error, setError] = useState("");

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
        client.transferTo(amount, recipient);
        setTransferAmount("");
    }

    return (
        <div className="box">
            <div>
                <label id="recipientLabel" htmlFor="recipientSelect"><b>Transfer to</b></label>
                <select id="recipientSelect" onChange={e => setRecipient(e.target.value)} defaultValue={"Bank"}>
                    {props.otherPlayers.map(p => <option key={p} value={p}>{p}</option>)}
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
    otherPlayers: PropTypes.arrayOf(PropTypes.string)
};

export default TransferTo;
