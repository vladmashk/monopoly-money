import PropTypes from 'prop-types';
import "./Main.css";
import {useEffect, useState} from "react";
import TransferTo from "./TransferTo.js";
import {client} from "../../index.js";
import Vote from "./Vote.js";
import TransferFrom from "./TransferFrom.js";
import OtherPlayers from "./OtherPlayers.js";
import Notification from "./Notification.js";

function Main(props) {

    const [money, setMoney] = useState(-1);

    const [notifications, setNotifications] = useState([]);

    const [votes, setVotes] = useState([]);

    const [state, setState] = useState(client.getState());

    useEffect(() => {
        client.updateMoney = updateMoney;
        client.startVote = startVote;
        client.endVote = endVote;
        client.updateState = updateState;
        client.addNotification = addNotification;
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
    }

    /**
     * @param {number} id
     */
    function endVote(id) {
        setVotes(votes => votes.filter(v => v.props.id !== id));
    }

    function updateState() {
        setState(s => client.getState());
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
        </div>
    );
}

Main.propTypes = {
    name: PropTypes.string
};

export default Main;
