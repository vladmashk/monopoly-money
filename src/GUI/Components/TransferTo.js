import {client} from "../../index.js";
import {useState} from "react";
import "./TransferTo.css";
import PropTypes from "prop-types";

function TransferTo(props) {

    const [recipient, setRecipient] = useState("Bank");

    const [transferAmount, setTransferAmount] = useState("");

    const [checkRecipient, setCheckRecipient] = useState(false);

    const [error, setError] = useState("");

    function showError(text) {
        setError(text);
        setTimeout(() => setError(""), 1000);
    }

    function transfer() {
        const stringAmount = transferAmount.replace(/\s/g, "");
        setError("");
        if (stringAmount === "" || stringAmount.includes(",")) {
            showError("Invalid amount");
            return;
        }
        let numberAmount;
        if (/^\d+\.?\d*[kKmM]$/.test(stringAmount)) {
            const multiplier = stringAmount.slice(-1).toLowerCase() === "k" ? 1000 : 1000000;
            numberAmount = parseFloat(stringAmount.slice(0, -1)) * multiplier;
        } else {
            numberAmount = parseInt(stringAmount);
        }
        if (isNaN(numberAmount) || numberAmount <= 0) {
            showError("Invalid amount");
            return;
        }
        client.transferTo(numberAmount, recipient);
        setTransferAmount("");
        setCheckRecipient(false);
    }

    function formatAndSetTransferAmount(inputValue) {
        setCheckRecipient(inputValue !== "");
        inputValue = inputValue.replace(/\s/g, "");
        if (/^\d+$/.test(inputValue)) {
            const amount = parseFloat(inputValue);
            setTransferAmount(amount.toLocaleString("en-US").replace(/,/g, " "));
        } else {
            setTransferAmount(inputValue);
        }
    }

    return (
        <div className="box">
            <div>
                <label id="recipientLabel" htmlFor="recipientSelect"><b>Transfer to</b></label>
                <select id="recipientSelect" onChange={e => setRecipient(e.target.value)} defaultValue={"Bank"}>
                    {props.otherPlayers.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                {checkRecipient && <span style={{color: "orange"}}>{" ← correct recipient?"}</span>}
            </div>
            <input id="transferToAmount"
                   className="amountInput"
                   placeholder="Enter amount to transfer"
                   value={transferAmount}
                   onChange={e => formatAndSetTransferAmount(e.target.value)}
                   onKeyUp={e => {
                       if (e.key === "Enter") {
                           transfer();
                       }
                   }}
            />
            <button onClick={() => transfer()}>Transfer</button>
            {error && <span className="error">{error}</span>}
        </div>
    );
}

TransferTo.propTypes = {
    otherPlayers: PropTypes.arrayOf(PropTypes.string)
};

export default TransferTo;
