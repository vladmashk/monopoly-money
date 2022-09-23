import './App.css';
import NameChooser from "./Components/NameChooser.js";
import {useEffect, useState} from "react";
import Main from "./Components/Main.js";
import {client} from "../index.js";

function App() {

    const [name, setName] = useState("");

    const [connected, setConnected] = useState(true);

    useEffect(() => {
        client.updateConnected = updateConnected;
    }, []);

    function updateConnected(connected) {
        setConnected(connected);
    }

    if (name) {
        return (
            <div className="App">
                {connected ? <span className="green">Connected</span> : <span className="red">Disconnected</span>}
                <Main name={name}/>
            </div>
        );
    } else {
        return (
            <div className="App AppMiddle">
                {connected ? <span className="green">Connected</span> : <span className="red">Disconnected</span>}
                <NameChooser setName={setName}/>
            </div>
        );
    }
}

export default App;
