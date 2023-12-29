import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import server from "../../utils";

function DisplayClasses (props: any) {

    const activateLink = props.activateLink
    const getClassDetails = props.getClassDetails
    const [classes, setClasses] = useState(null);
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate()

    function getClasses () {
        const tokenData = JSON.parse(window.localStorage.getItem("auth_tokens"))
        const token = `Bearer ` + tokenData.access

        axios.get(`${server.absolute_url}/${server.workspace}/`, {
            headers: {
                "Content-Type": "application/json",
                // "authorization": token
            }
        }).then((res) => {
            window.localStorage.setItem("classes", JSON.stringify(res.data.results))
            setClasses(res.data.results)

        }).catch(err => {
            if(err.message === "Network Error") {
                console.log(err);
            }

        })
    }
    function getUser () {
    // axios.get(`${server.absolute_url}/${server.user}/${userData.id}/`, {
    //     headers: {
    //         "Content-Type": "application/json",
    //         // "authorization": token
    //     }
    // }).then((res) => {
    //     setUserData(res.data)
    //     window.localStorage.setItem("user_data", JSON.stringify(res.data))
 
    // }).catch(err => {
    //     if(err.message === "Network Error") {
    //         console.log(err);
    //     }

    // })
    }

    useEffect(() => {
            setClasses(JSON.parse(window.localStorage.getItem("classes")));
            // setUserData(JSON.parse(window.localStorage.getItem("user_data")));
            getClasses();
            // getUser();

    },[])

    return ( 
        <div>
            <ul>
                {classes && classes.map(topic =>           
                    <li id={`${topic.id}`} key={topic.id} onClick={(e) => {
                        if (activateLink){
                            activateLink(e)
                        }else{getClassDetails(e)}
                    }}>
                        {topic.title}
                    </li>
                )}
            </ul>
        </div>
    );
}
 
export default DisplayClasses;