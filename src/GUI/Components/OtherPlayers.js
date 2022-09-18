import "./OtherPlayers.css";
import PropTypes from "prop-types";

function OtherPlayers(props) {
    return (
        <div className="box">
            <b id="otherPlayersTitle">Other players</b>
            {Object.keys(props.state).filter(n => n !== "Bank")
                .map(n => <span className="otherPlayer" key={n}><span>{n}</span><span>{props.state[n].toLocaleString("fr")}</span></span>)}
        </div>
    );
}

OtherPlayers.propTypes = {
    state: PropTypes.object
};

export default OtherPlayers;
