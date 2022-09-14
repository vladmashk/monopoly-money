import "./TransferFrom.css"
import {useState} from "react";
import {client} from "../../index.js";

function TransferFrom(props) {

    const [transferAmount, setTransferAmount] = useState("");

    function transfer() {
        if (transferAmount === "") {
            return;
        }
        const amount = parseInt(transferAmount);
        if (isNaN(amount) || amount === 0) {
            return;
        }
        client.transferFromBank(amount);
        setTransferAmount("");
    }

    return (
        <div className="box">
            <label htmlFor="transferFromAmount"><b>Transfer from bank</b></label>
            <input id="transferFromAmount" type="number" min={1} placeholder="Enter amount to transfer" value={transferAmount} onChange={e => setTransferAmount(e.target.value)}/>
            <button onClick={() => transfer()}>Start vote</button>
        </div>
    );
}

TransferFrom.propTypes = {

};

export default TransferFrom;
