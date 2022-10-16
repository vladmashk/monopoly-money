import PropTypes from "prop-types";
import {formatMoney} from "../../index.js";

function Notification(props) {
    return (
        <div className="box centeredFlex" style={{marginBottom: "7px"}}>
            <span>You received <b>{formatMoney(props.amount)}</b> from <b>{props.from}</b>!</span>
        </div>
    );
}

Notification.propTypes = {
    from: PropTypes.string,
    amount: PropTypes.number,
    id: PropTypes.number
};

export default Notification;
