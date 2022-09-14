import './App.css';
import NameChooser from "./Components/NameChooser.js";
import {useState} from "react";
import Main from "./Components/Main.js";

function App() {

    const [name, setName] = useState("");

    return (
        <div className="App">
            <NameChooser setName={setName}/>
            {name && <Main name={name}/>}
        </div>
    );
}

export default App;
