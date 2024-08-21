import React from "react";


function DisplayOptions (props: any) {
    const checkAnswer = props.checkAnswer
    const options = props.options

    return ( 
        <div id="answer-area" className="answer-area">
            {
                options.map((option: any, index: any) => (
                    <button key={index} onClick={(e) => {
                        checkAnswer(e);
                    }}>{ option }</button>
                ))
            }
        </div>
     );
}
 
export default DisplayOptions;