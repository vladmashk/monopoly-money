import "./Vote.css";
import PropTypes from "prop-types";
import {useState} from "react";
import {client} from "../../index.js";

function Vote(props) {

    const [visible, setVisible] = useState(true);

    function vote(choice) {
        setVisible(false);
        client.playerVote(props.id, choice);
    }

    if (visible) {
        return (
            <div className="box doubleBorder vote">
                <div className="centeredFlex">
                    <b className="voteTitle">Vote</b>
                    <p>Should <b>{props.recipient}</b> receive <b>{props.amount.toLocaleString("en-US").replace(/,/g, " ")}</b> from the bank?</p>
                </div>
                <div id="buttonsDiv">
                    <button className="agree" onClick={() => vote(true)}>Yes</button>
                    <button className="disagree" onClick={() => vote(false)}>No</button>
                </div>
            </div>
        );
    }
}

Vote.propTypes = {
    id: PropTypes.number,
    amount: PropTypes.number,
    recipient: PropTypes.string
};

export default Vote;
