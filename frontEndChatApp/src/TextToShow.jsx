

function TextToShow({TypeOfWhose,chatText}){

    return (
        <div className="eachTextDiv" style={{justifyContent:`${TypeOfWhose==='Mine'?'end':'start'}`}}>
            <div className="mineText">
                 <div className={`${TypeOfWhose==="Mine"?"mineIndicator":"othersIndicator"}`}>
                 </div>
                 <div className="contentForZIndex">{chatText}</div>
            </div>
            
        </div>
    )
}
export default TextToShow