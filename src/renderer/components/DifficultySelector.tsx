import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import server from "../utils";
import DisplayLevels from "./sections/DisplayLevels";

function DifficultySelector () {

    const navigate = useNavigate()

    const getLeveldetails = (e: any) => {
        console.log(e.target.id)
        window.localStorage.setItem("oldlevels", JSON.stringify([e.target.id]))

        navigate('/home')
    }


    return (
        <div className="display-difficulty-selector">
            <div className="paragraph">
                <h2>Select your level of difficulty</h2>
            </div>
            <div className="difficulty-selector">
                <DisplayLevels getLeveldetails={getLeveldetails} />
            </div>
        </div>
     );
}

export default DifficultySelector;
