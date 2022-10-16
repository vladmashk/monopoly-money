import "./TransferFrom.css"
import {useState} from "react";
import {client, formatMoney} from "../../index.js";

function TransferFrom() {

    const [transferAmount, setTransferAmount] = useState("");

    const [error, setError] = useState("");

    function showError(text) {
        setError(text);
        setTimeout(() => setError(""), 1000);
    }

    function transfer() { // TODO: extract duplicate
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
        client.transferFromBank(numberAmount);
        setTransferAmount("");
    }

    function formatAndSetTransferAmount(inputValue) {
        inputValue = inputValue.replace(/\s/g, "");
        if (/^\d+$/.test(inputValue)) {
            const amount = parseFloat(inputValue);
            setTransferAmount(formatMoney(amount));
        } else {
            setTransferAmount(inputValue);
        }
    }

    return (
        <div className="box">
            <label htmlFor="transferFromAmount"><b>Transfer from bank</b></label>
            <input id="transferFromAmount"
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
            <button onClick={() => transfer()}>Start vote</button>
            {error && <span className="error">{error}</span>}
        </div>
    );
}

TransferFrom.propTypes = {

};

export default TransferFrom;
