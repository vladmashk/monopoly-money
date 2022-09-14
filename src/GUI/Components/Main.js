import PropTypes from 'prop-types';
import "./Main.css";
import {useEffect, useState} from "react";
import TransferTo from "./TransferTo.js";
import startingAmount from "../../startingAmount.js";
import {client} from "../../index.js";
import Vote from "./Vote.js";
import TransferFrom from "./TransferFrom.js";

function Main(props) {

    const [money, setMoney] = useState(startingAmount);

    const [votes, setVotes] = useState([]);

    useEffect(() => {
        client.updateMoney = updateMoney;
        client.startVote = startVote;
        client.endVote = endVote;
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
        setVotes(votes => votes.concat([<Vote key={id} id={id} recipient={recipient} amount={amount}/>]));
    }

    /**
     * @param {number} id
     */
    function endVote(id) {
        setVotes(votes => votes.filter(v => v.props.id !== id));
    }

    return (
        <div id="Main">
            {votes}
            <span>You are</span>
            <p><b>{props.name}</b></p>
            <span>You have</span>
            <span id="moneyCounter">{money}</span>
            <TransferTo/>
            <br/>
            <TransferFrom/>
        </div>
    );
}

Main.propTypes = {
    name: PropTypes.string
};

export default Main;
