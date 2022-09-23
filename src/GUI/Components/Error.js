import PropTypes from "prop-types";

function Error(props) {
    return (
        <div className="box centeredFlex error" style={{borderColor: "red", marginBottom: "7px"}}>
            <b className="red">Error</b>
            <span className="red">{props.message}</span>
        </div>
    );
}

Error.propTypes = {
    message: PropTypes.string,
    id: PropTypes.number
};

export default Error;
