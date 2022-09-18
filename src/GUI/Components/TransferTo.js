import {client} from "../../index.js";
import {useEffect, useState} from "react";
import "./TransferTo.css";

function TransferTo(props) {

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

    function transfer() {
        setError("");
        if (transferAmount === "") {
            return;
        }
        const amount = parseInt(transferAmount);
        if (isNaN(amount) || amount === 0) {
            return;
        }
        if (!client.transferTo(amount, recipient)) {
            setError("Transfer failed");
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
