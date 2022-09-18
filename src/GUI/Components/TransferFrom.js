import "./TransferFrom.css"
import {useState} from "react";
import {client} from "../../index.js";

function TransferFrom() {

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
        client.transferFromBank(amount);
        setTransferAmount("");
    }

    return (
        <div className="box">
            <label htmlFor="transferFromAmount"><b>Transfer from bank</b></label>
            <input id="transferFromAmount"
                   className="amountInput"
                   type="number"
                   min={1}
                   placeholder="Enter amount to transfer"
                   value={transferAmount}
                   onChange={e => setTransferAmount(e.target.value)}/>
            <button onClick={() => transfer()}>Start vote</button>
            {error && <span className="error">{error}</span>}
        </div>
    );
}

TransferFrom.propTypes = {

};

export default TransferFrom;
