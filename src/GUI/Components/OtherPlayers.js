import "./OtherPlayers.css";
import PropTypes from "prop-types";
import {formatMoney} from "../../index.js";

function OtherPlayers(props) {
    return (
        <div className="box">
            <b className="boxTitle">Other players</b>
            {Object.keys(props.state).filter(n => n !== "Bank")
                .map(n => <span className="otherPlayer" key={n}><span>{n}</span><span>{formatMoney(props.state[n])}</span></span>)}
        </div>
    );
}

OtherPlayers.propTypes = {
    state: PropTypes.object
};

export default OtherPlayers;
