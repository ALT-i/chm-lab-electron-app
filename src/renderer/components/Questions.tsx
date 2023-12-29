import React from "react";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
// import { ipcRenderer } from "electron";



import server from '../utils'
// import SectionPanelHandle from "./sections/SectionPanelHandle";


const Questions = () => {
    // const [questions, setQuestions] = useState([])
    // const [categories, setCategories] = useState([])

    const { class_id } = useParams();

    const navigate = useNavigate();

    // const ipcRenderer = window.ipcRenderer;
    
    // const storeData = (signal, reciever, data) => {             // Maybe make this a separate component
    //     ipcRenderer.send(signal, (JSON.stringify(data)));
    //     ipcRenderer.on(reciever, (statement) => {
    //     console.log(statement);
    //     // });
    //     window.electronApi.endStoreData()
    // }

    // function getToken () {
    //     let token
    //     const tokenData = JSON.parse(window.localStorage.getItem("tokens"))
    //     if (!tokenData) {
    //         navigate('/')
    //     }else{
    //         token = `Bearer ` + tokenData.access
    //     }

    //     return token
    // }

    // function getAllCategories () {
    //     fetch(server.absolute_url + '/categories',{
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': getToken()
    //     }
    //     }).then((res) => res.json())
    //     .then((replyData) => {
    //         setCategories(replyData);
    //         console.log(replyData)
    //         // storeData('storeData', 'storeDataComlpete', replyData)
    //         })
    //     .catch((err) => {
    //         console.log(err.message);
    //         if (err.message.includes("Unauthorized")) 
    //         navigate('/')
    //     });

    // }

    // function getAllQuestions () { 

    //     fetch(server.absolute_url + '/questions',{
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'Authorization': getToken()
    //         }
    //     })
    //     .then((res) => (res.json()))
    //     .then((data) => {
    //         setQuestions(data.questions);
    //         console.log(data.questions);
    //     })
    //     .catch((err) => {
    //         console.log(err.message);
    //         if (err.message.includes("Unauthorized")) 
    //         navigate('/')
    //     });
    // }

    // const dataCheck = (status: any) => {
    //     // console.log(status)
    //     if (!status.check) {
    //         getAllCategories()
    //         getAllQuestions()
    //     }
    //     else{
    //         setCategories(JSON.parse(status.data))
    //         getAllCategories()
    //         getAllQuestions()
    //     }
    // }

    
    
    // useEffect(() => {

    //     getAllCategories();
    //     getAllQuestions();
    //     // ipcRenderer.send("categoryDataCheck", {});
    //     // ipcRenderer.on("categoryDataCheckStatus", (res) => {
    //     //     dataCheck(res)
    //     // })
    //     // // window.electronApi.endCategoryDataCheck().
    //     // window.electronApi.endStoreData()

    // }, []);

    // const getQuestionsById = (category_id: any) => {
    //     let token
    //     const tokenData = JSON.parse(window.localStorage.getItem("tokens"))
    //     if (!tokenData) {
    //         navigate('/')
    //     }else{
    //         token = `Bearer ` + tokenData.access
    //     }

    //     fetch(`${server.absolute_url}/categories/${category_id}/questions`,{
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'Authorization': token
    //         }
    //     })
    //     .then((res) => (res.json()))
    //     .then((data) => {
    //         setQuestions(data.questions);
    //     })
    //     .catch((err) => {
    //         console.log(err.message);
    //         if (err.message.includes("Unauthorized")) 
    //         navigate('/')
    //     });
    // }

    const setActivity = (id :string) => {
        document.getElementById(`arrhead-${id}`).classList.toggle("active")
        document.getElementById(`compartment-${id}`).classList.toggle("active")
    }
 
    
    // const endSession = () => {
    //     let token
    //     const tokenData = JSON.parse(window.localStorage.getItem("tokens"))
    //     if (!tokenData) {
    //         navigate('/')
    //     }else{
    //         token = `Bearer ` + tokenData.access
    //     }

    //     let payload = tokenData.access.split('.')[1];
    //     payload = JSON.parse(window.atob(payload))
        
    //     axios.post(`${server.absolute_url}/sign-out`,
    //         {},
    //         {
    //             headers: {
    //                 "Content-Type": "application/json",
    //                 "Authorization": token
    //             }
    //         }
    //     ).then((res) => console.log(res.data)).catch(err => console.log(err))

    //     window.localStorage.removeItem("tokens")
    // }

    


    return ( 
        <div className="">
            <div className="side-panel">
                <div className="category-view">
                    <div className="panel-title">
                        <h3>
                            Instruments
                        </h3>
                    </div>
                    <ul>
                        {/* {categories.map((category) => (
                            <div className="options" key={category.category_id} >
                                <div className="options-box-header" onClick={() => {
                                    setActivity(category.category_id);
                                }}
                                >
                                    <li>
                                        {category.type}
                                    </li>
                                    <i id={`arrhead-${category.category_id}`} className="fa fa-angle-down arrhead"></i>
                                </div>
                                <div id={`compartment-${category.category_id}`} className="option-box-compartment">
                                    <div className="icons">
                                        <i className="fa fa-angle-down arrhead"></i>
                                    </div>
                                    <div className="icons">
                                        <i className="fa fa-angle-down arrhead"></i>
                                    </div>
                                    <div className="icons">
                                        <i className="fa fa-angle-down arrhead"></i>
                                    </div>
                                </div>
                            </div>
                        ))} */}
                        <div className="options">
                            <div className="options-box-header" onClick={() => {
                                setActivity("one");
                            }}
                            >
                                <li>
                                    Glassware
                                </li>
                                <i id="arrhead-one" className="fa fa-angle-down arrhead"></i>
                            </div>
                            <div id="compartment-one" className="option-box-compartment">
                                <div className="icons">
                                    <i className="fa fa-angle-down arrhead"></i>
                                </div>
                                <div className="icons">
                                    <i className="fa fa-angle-down arrhead"></i>
                                </div>
                                <div className="icons">
                                    <i className="fa fa-angle-down arrhead"></i>
                                </div>
                            </div>
                        </div>
                        <div className="options">
                            <div className="options-box-header" onClick={() => {
                                setActivity("two");
                            }}
                            >
                                <li>
                                    Substances
                                </li>
                                <i id="arrhead-two" className="fa fa-angle-down arrhead"></i>
                            </div>
                            <div id="compartment-two" className="option-box-compartment">
                                <div className="icons">
                                    <i className="fa fa-angle-down arrhead"></i>
                                </div>
                                <div className="icons">
                                    <i className="fa fa-angle-down arrhead"></i>
                                </div>
                                <div className="icons">
                                    <i className="fa fa-angle-down arrhead"></i>
                                </div>
                            </div>
                        </div>
                        <div className="options">
                            <div className="options-box-header" onClick={() => {
                                setActivity("three");
                            }}
                            >
                                <li>
                                    Articles
                                </li>
                                <i id="arrhead-three" className="fa fa-angle-down arrhead"></i>
                            </div>
                            <div id="compartment-three" className="option-box-compartment">
                                <div className="icons">
                                    <i className="fa fa-angle-down arrhead"></i>
                                </div>
                                <div className="icons">
                                    <i className="fa fa-angle-down arrhead"></i>
                                </div>
                                <div className="icons">
                                    <i className="fa fa-angle-down arrhead"></i>
                                </div>
                            </div>
                        </div>
                    </ul>
                </div>
            {/* <Link to='/' onClick={endSession} className="log-out">Log out</Link> */}
            <Link to='/' className="log-out">Log out</Link>
            </div>
            <div className="display-panel">
                <div className="question-view">
                    <div className="panel-title">
                        <h3>
                            Workspace
                        </h3>
                    </div>
                    <ul>
                        <li>
                            You're viewing { class_id }
                        </li>
                        {/* {questions.map((question) => (
                            <li key={question.question_id}>
                                <div className="question-group">
                                    <p className="question">{question.question}</p>
                                    <p className="answer"><strong>Answer: </strong> {question.answer}</p>
                                </div>
                            </li>
                        ))} */}
                    </ul>
                </div>
                <></>
            </div>
        </div>
    );
}
 
export default Questions;