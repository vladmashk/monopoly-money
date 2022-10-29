import PropTypes from 'prop-types';
import "./Main.css";
import {useEffect, useState} from "react";
import TransferTo from "./TransferTo.js";
import {client} from "../../index.js";
import Vote from "./Vote.js";
import TransferFrom from "./TransferFrom.js";
import OtherPlayers from "./OtherPlayers.js";
import Notification from "./Notification.js";
import Transactions from "./Transactions.js";

function Main(props) {

    const [money, setMoney] = useState(-1);

    const [notifications, setNotifications] = useState([]);

    const [votes, setVotes] = useState([]);

    const [state, setState] = useState(client.getState());

    const [transactions, setTransactions] = useState([])

    useEffect(() => {
        client.updateMoney = updateMoney;
        client.startVote = startVote;
        client.endVote = endVote;
        client.updateState = updateState;
        client.addNotification = addNotification;
        client.updateTransactions = updateTransactions;
    }, []);

    function updateMoney(money) {
        setMoney(money);
    }

    /**
     * @param {number} id
     * @param {string} recipient
     * @param {number} amount
     */
    function startVote(id, recipient, amount) {
        setVotes(votes => [<Vote key={id} id={id} recipient={recipient} amount={amount}/>].concat(votes));
        window.scrollTo(0, 0)
    }

    /**
     * @param {number} id
     */
    function endVote(id) {
        setVotes(votes => votes.filter(v => v.props.id !== id));
    }

    /**
     *
     * @param {{[name: string]: number}} state
     */
    function updateState(state) {
        setState(s => state);
    }

    /**
     * @param {string} from
     * @param {number} amount
     */
    function addNotification(from, amount) {
        const id = Math.round(Math.random() * Number.MAX_SAFE_INTEGER);
        setNotifications(n => [<Notification key={id} id={id} from={from} amount={amount}/>].concat(n));
        setTimeout(() => {
            setNotifications(n => n.filter(e => e.props.id !== id));
        }, 3000);
    }

    /**
     * @param {{from: string, to: string, amount: number}[]} transactions
     */
    function updateTransactions(transactions) {
        setTransactions(t => transactions)
    }

    return (
        <div id="Main">
            {notifications}
            {votes}
            <span>You are</span>
            <p><b>{props.name}</b></p>
            <span>You have</span>
            <span id="moneyCounter" onClick={() => client.requestUpdateMoney()} title="Refresh money amount">
                {money.toLocaleString("en-US", {notation: "standard"}).replace(/,/g, " ")}
            </span>
            <TransferTo otherPlayers={Object.keys(state).filter(n => n !== props.name)}/>
            <br/>
            <TransferFrom/>
            <br/>
            <OtherPlayers state={state}/>
            <br/>
            <Transactions transactions={transactions}/>
        </div>
    );
}

Main.propTypes = {
    name: PropTypes.string
};

export default Main;
