import PropTypes from 'prop-types';
import "./Main.css";
import {useEffect, useState} from "react";
import TransferTo from "./TransferTo.js";
import {client} from "../../index.js";
import Vote from "./Vote.js";
import TransferFrom from "./TransferFrom.js";

function Main(props) {

    const [money, setMoney] = useState(-1);

    const [votes, setVotes] = useState([<Vote key={1} id={1} recipient={"Tim"} amount={50}/>]);

    useEffect(() => {
        client.updateMoney = updateMoney;
        client.startVote = startVote;
        client.endVote = endVote;
    }, []);

    function updateMoney(money) {
        console.log("Updated money GUI")
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

    return (
        <div id="Main">
            {votes}
            <span>You are</span>
            <p><b>{props.name}</b></p>
            <span>You have</span>
            <span id="moneyCounter" onClick={() => client.requestUpdateMoney()} title="Refresh money amount">
                {money.toLocaleString("fr", {notation: "standard"})}
            </span>
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
