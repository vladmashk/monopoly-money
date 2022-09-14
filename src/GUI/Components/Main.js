import PropTypes from 'prop-types';
import "./Main.css";
import {useEffect, useState} from "react";
import TransferTo from "./TransferTo.js";
import startingAmount from "../../startingAmount.js";
import {client} from "../../index.js";

function Main(props) {

    const [money, setMoney] = useState(startingAmount);

    useEffect(() => {
        client.updateMoney = updateMoney;
    }, []);

    function updateMoney(money) {
        setMoney(money);
    }

    return (
        <div id="Main">
            <p><b>{props.name}</b></p>
            <span>you have</span>
            <span id="moneyCounter">{money}</span>
            <TransferTo/>
        </div>
    );
}

Main.propTypes = {
    name: PropTypes.string
};

export default Main;
