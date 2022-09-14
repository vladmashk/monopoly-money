import PropTypes from 'prop-types';
import "./NameChooser.css";
import {useState} from "react";
import {client} from "../../index.js";

function NameChooser(props) {

    const [visible, setVisible] = useState(true);

    const [name, setName] = useState("");

    const [error, setError] = useState("");

    function choose(name) {
        client.addPlayer(name).then(result => {
            if (result) {
                setError("")
                setVisible(false);
            } else {
                setError("Try another name.");
            }
        });
    }

    if (visible) {
        return (
            <div className="box">
                <label htmlFor="nameInput" id="ncLabel">Choose name:</label>
                <input id="nameInput" placeholder="Enter name here" value={name} onChange={e => setName(e.target.value)}/>
                <button onClick={() => choose(name)}>Select</button>
                {error && <span className="error">{error}</span>}
            </div>
        );
    }
}

NameChooser.propTypes = {

};

export default NameChooser;
