import './App.css';
import NameChooser from "./Components/NameChooser.js";
import {useState} from "react";
import Main from "./Components/Main.js";

function App() {

    const [name, setName] = useState("");

    if (name) {
        return (
            <div className="App">
                <Main name={name}/>
            </div>
        );
    } else {
        return (
            <div className="App AppMiddle">
                <NameChooser setName={setName}/>
            </div>
        );
    }
}

export default App;
