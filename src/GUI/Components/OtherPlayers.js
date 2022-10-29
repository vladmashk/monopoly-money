import "./OtherPlayers.css";
import PropTypes from "prop-types";
import {formatMoney} from "../../index.js";

function OtherPlayers(props) {

    function compareFunction(name1, name2) {
        return props.state[name2] - props.state[name1]
    }

    return (
        <div className="box">
            <b className="boxTitle">Other players</b>
            {[...Object.keys(props.state)].filter(n => n !== "Bank").sort(compareFunction).map(n =>
                <span className="otherPlayer" key={n}>
                    <span>{n}</span>
                    <span>{formatMoney(props.state[n])}</span>
                </span>
            )}
        </div>
    );
}

OtherPlayers.propTypes = {
    state: PropTypes.object
};

export default OtherPlayers;
