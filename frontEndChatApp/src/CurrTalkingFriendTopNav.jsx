import { useContext } from "react"
import { useNavigate } from "react-router-dom"
import contextForWebsocket from "./websocketContent"


function CurrChattingShowingDivMain({nameOfFriend}){
    const {phoneDisplayGoneOnButtonClick}=useContext(contextForWebsocket)
    const navigate=useNavigate()
    return (
        <div className="topChattingCurrHappening">
            <div className="imageANDname">
                     <div className="arrow" onClick={phoneDisplayGoneOnButtonClick}><i className="ri-arrow-left-line"></i></div>
                     <div className="specificFriendsTalkingToFirstLetterImage"><img src="./avtar.svg" style={{width:'100%',height:'100%'}} alt="avatar"></img></div>
                     <div className="specificFriendsTalkingTo">{nameOfFriend}</div>
            </div>
            <div className="DELETEBUTTONFORMESSAGES">
            <img src="./menu.svg" style={{width:'15px',height:'15px'}}></img>
            </div>
        </div>
    )
}
export default CurrChattingShowingDivMain