import PropTypes from 'prop-types';
import "./NameChooser.css";
import {useState} from "react";
import {client} from "../../index.js";

function NameChooser(props) {

    const [name, setName] = useState("");

    const [error, setError] = useState("");

    function choose(name) {
        if (name === "") {
            return;
        }
        name = name.trim();
        client.addPlayer(name).then(result => {
            if (result) {
                setError("");
                props.setName(name);
            } else {
                setError("Try another name.");
            }
        });
    }

    return (
        <div className="box">
            <label htmlFor="nameInput" id="ncLabel">Choose name:</label>
            <input id="nameInput" placeholder="Enter name here" value={name} onChange={e => setName(e.target.value)}/>
            <button onClick={() => choose(name)}>Select</button>
            {error && <span className="error">{error}</span>}
        </div>
    );
}

NameChooser.propTypes = {
    setName: PropTypes.func
};

export default NameChooser;
