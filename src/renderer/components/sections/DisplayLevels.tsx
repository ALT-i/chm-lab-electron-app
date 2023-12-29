import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import server from "../../utils";

function DisplayLevels (props: any) {
    const activateLink = props.activateLink
    const getLeveldetails = props.getLeveldetails
    const [levels, setLevels] = useState([])
    const navigate = useNavigate()


    useEffect(() => {
        const stagedLevels = JSON.parse(window.localStorage.getItem("levels"))
        if(stagedLevels) {
            setLevels(stagedLevels)
            let token
            const tokenData = JSON.parse(window.localStorage.getItem("tokens"))
            if (!tokenData) {
                navigate('/')
            }else{
                token = `Bearer ` + tokenData.access
            }

            axios.get(`${server.absolute_url}/levels`, {
                headers: {
                    "Content-Type": "application/json",
                    "authorization": token
                }
            }).then((res) => {
                setLevels(res.data)
                window.localStorage.setItem("levels", JSON.stringify(res.data))

            }).catch(err => {
                // if(err.message === "Network Error") setLevels(oldLevels);
                console.log(err)

            })
        }
        else{
            let token
            const tokenData = JSON.parse(window.localStorage.getItem("tokens"))
            if (!tokenData) {
                navigate('/')
            }else{
                token = `Bearer ` + tokenData.access
            }

            axios.get(`${server.absolute_url}/levels`, {
                headers: {
                    "Content-Type": "application/json",
                    "authorization": token
                }
            }).then((res) => {
                setLevels(res.data)
                window.localStorage.setItem("levels", JSON.stringify(res.data))

            }).catch(err => {
                // if(err.message === "Network Error") setLevels(oldLevels);
                // console.log(err)

            })
        }

    },[])

    return (
        <div>
            <ul>
                {levels.map((level) =>
                    <li id={`${level.level_id}`} key={level.level_id} onClick={(e) => {
                        if (activateLink){
                            activateLink(e)
                        }else{getLeveldetails(e)}
                    }}>
                        {level.level_name}
                    </li>
                )}
            </ul>
        </div>
    );
}

export default DisplayLevels;
