import React, { useEffect, useState, CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode as jwt_decode} from "jwt-decode";

import PulseLoader from "react-spinners/PulseLoader";

import { Button } from 'renderer/components'

import server from "../../utils"

function SectionLogin () {
    const navigate = useNavigate()
    const [feedback, setFeedback] = useState(null)
    const [isloading, setIsLoading] = useState(false)
    const override: CSSProperties = {
        fontWeight: "400",
      };


    type authResData = {
        user_id? : string
    }


    async function getUserData (id: string) {
        axios.get(`${server.absolute_url}/${server.user}/${id}/`)
        .then((res) => {
            window.localStorage.setItem("user_data", JSON.stringify(res.data))
        }).catch(err => {
            console.log(err)
            setFeedback(err.message)
        })
    }

    const authLogin = (e: any) => {
        setIsLoading(true)
        e.preventDefault()

        // console.log(`${server.absolute_url}/${server.user_auth}/login`) ///api/v1/users/
        axios.post(`${server.absolute_url}/${server.auth_signin}`, {
            email: e.target[0].value,
            password: e.target[1].value
        },
            {headers : {
                'Content-Type': 'application/json',
                }
        }).then((res) => {
            window.localStorage.setItem("auth_tokens", JSON.stringify(res.data))
            const userInfo: authResData  = ( jwt_decode(res.data.access))
            getUserData(userInfo.user_id)
            setFeedback(null)
            setTimeout(() => {
                navigate('/home');
                setIsLoading(false);
            }, 1000);
        }).catch(err => {
            console.log(err)
            setIsLoading(false)
            if(err.message.includes("401")) {
                setFeedback("Invalid credentials");
            }
        })

    }

    useEffect(() => {
        if (!feedback) setFeedback(null);
    }, [authLogin])

    return (
        <div className="section-login">
            {feedback && <p className="alert">{feedback}</p>}
            <br/>
            <form action="" onSubmit={authLogin} id="login" className="login">
                <div>
                    <label htmlFor="email">Email:</label>
                    <input id="email" type="text" name="username"/>
                </div>
                <div>
                    <label htmlFor="pwd">Password:</label>
                    <input id="pwd" type="password" name="password"/>
                </div>
                <div className="submit">
                    <Button value="Submit" type="submit" form="login">{isloading? <PulseLoader
                        color={"#ffffff"}
                        loading={true}
                        cssOverride={override}
                        size={10}
                        aria-label="Loading Spinner"
                        data-testid="loader"
                    /> : 'Login'}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default SectionLogin;
