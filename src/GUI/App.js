import './App.css';
import NameChooser from "./Components/NameChooser.js";
import {useEffect, useState} from "react";
import Main from "./Components/Main.js";
import {client} from "../index.js";
import Error from "./Components/Error.js";

function App() {

    const [name, setName] = useState("");

    const [errors, setErrors] = useState([]);

    const [connected, setConnected] = useState(true);

    useEffect(() => {
        client.updateConnected = updateConnected;
        client.addError = addError;
    }, []);

    function updateConnected(connected) {
        setConnected(connected);
    }

    /**
     * @param {string} error
     */
    function addError(error) {
        const id = Math.round(Math.random() * Number.MAX_SAFE_INTEGER);
        setErrors(errors => [<Error message={error} key={id} id={id}/>].concat(errors));
        window.scrollTo(0, 0);
        setTimeout(() => {
            setErrors(errors => errors.filter(e => e.props.id !== id));
        }, 3000);
    }

    let mainContent;
    if (name) {
        mainContent = <Main name={name}/>;
    } else {
        mainContent = <NameChooser setName={setName}/>;
    }

    return (
        <div className={"App" + (name ? "" : " AppMiddle")}>
            {errors}
            {connected ? <span className="green">Connected</span> : <span className="red">Disconnected</span>}
            {mainContent}
        </div>
    );
}

export default App;
