import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import server from "../../utils"
import DisplayOptions from "./DisplayOptions";
import DisplayCategories from "./DisplayCategories";

interface QuestionItem {
  question_id: string;
  answer: string;
}

function SectionQuizBox () {
    const [questionItem, setQuestionItem] = useState(null)
    const [categories, setCategories] = useState(null)
    const [questionList, setQuestionList] = useState(null)
    const navigate = useNavigate()
    const [score, setScore] = useState(0)
    const [count, setCount] = useState(0)

    const trimList = (questionList: QuestionItem[], id: string): QuestionItem[] => {
        if (!Array.isArray(questionList)) return []
        return questionList.filter(item => item.question_id !== id)
    }

    const checkAnswer = (e: any) => {
        if (questionItem.answer === e.target.innerHTML) {
            e.target.classList.add("correct")
            setScore((c) => c+1)
        }
        else{
            e.target.classList.add("wrong")
        }
        setTimeout(() => {
            e.target.classList.remove("wrong")
            e.target.classList.remove("correct")
            playQuiz(trimList(questionList, questionItem.question_id), questionItem.question_id);
        }, 1000)

    }

    const playQuiz = (questions: any, category: any) => {
        if(questions.length > 0){
            let token
            const tokenData = JSON.parse(window.localStorage.getItem("tokens"))
            if (!tokenData) {
                navigate('/')
            }else{
                token = `Bearer ` + tokenData.access
            }

            axios.post(`${server.absolute_url}/quizzes`, {
                "quiz_category": category,
                "previous_questions": questions
            },{
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                }
            }).then((res) => {
                setQuestionList(questions)
                setQuestionItem(res.data)
            })
        } else{
            setQuestionItem([])
        }

    }

    const startQuiz = (category_id: any) => {
        let token
        const tokenData = JSON.parse(window.localStorage.getItem("tokens"))
        if (!tokenData) {
            navigate('/')
        }else{
            token = `Bearer ` + tokenData.access
        }

        fetch(`${server.absolute_url}/categories/${category_id}/questions`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            }
        })
        .then((res) => (res.json()))
        .then((data) => {
            const questionIdList = []
            for (const item of data.questions) {
                questionIdList.push(item.question_id)
            }
            setCount(questionIdList.length)
            playQuiz(questionIdList, data.current_category)
        })
    }

    useEffect(() => {
        let token
        const tokenData = JSON.parse(window.localStorage.getItem("tokens"))
        if (!tokenData) {
            navigate('/')
        }else{
            token = `Bearer ` + tokenData.access
        }

        fetch(server.absolute_url + '/categories', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            }
        })
           .then((res) => res.json())
           .then((data) => {
               setCategories(data);
           })
           .catch((err) => {
              console.log(err.message);
           });
    }, []);



    return (
        <div>
            {!questionItem ?
            <div className="return-button">
                <Link to="/home">Back</Link>
            </div> :
            <div className="game-buttons">
                <Link to='/home'>End Quiz</Link>
                {/* <button >Pause</button> */}
            </div>}
            <div className="quiz-box">
                <div className="quiz-area">
                {!questionItem ?
                <div>
                    <div className="start-page">
                        <h2>Select a category and click the button to begin</h2>
                        <select id="category" name="category">
                            <DisplayCategories categories={categories} />
                        </select>
                        <button onClick={() => startQuiz((document.getElementById("category") as HTMLInputElement).value)}>Start</button>
                    </div>
                    </div> :  questionList.length === 0 ? <div className="result-page">
                        <h3>Your scored</h3>
                        <h2>{ score }</h2>
                        <h3>out of</h3>
                        <h2>{ count }</h2>
                    </div> : <div className="question-page">
                        <div className="question-area">
                            <h3>{questionItem.question}</h3>
                        </div>
                        <DisplayOptions options={ questionItem.options } checkAnswer={checkAnswer}/>
                    </div>
                    }
                </div>
            </div>
        </div>
    );
}

export default SectionQuizBox;
