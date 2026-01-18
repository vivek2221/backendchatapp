import { useContext } from "react"
import { useNavigate } from "react-router-dom"
import contextForWebsocket from "./websocketContent"


function CurrChattingShowingDivMain({nameOfFriend}){
    const {phoneDisplayGoneOnButtonClick}=useContext(contextForWebsocket)
    const navigate=useNavigate()
    return (
        <div className="topChattingCurrHappening">
                     <div className="arrow" onClick={phoneDisplayGoneOnButtonClick}><i className="ri-arrow-left-line"></i></div>
                     <div className="specificFriendsTalkingToFirstLetterImage">{nameOfFriend[0].toUpperCase()}</div>
                     <div className="specificFriendsTalkingTo">{nameOfFriend}</div>
                   </div>
    )
}
export default CurrChattingShowingDivMain