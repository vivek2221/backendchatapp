import { useNavigate } from "react-router-dom"


function CurrChattingShowingDivMain({nameOfFriend}){
    const navigate=useNavigate()
    return (
        <div className="topChattingCurrHappening">
                     <div className="arrow" ><i className="ri-arrow-left-line"></i></div>
                     <div className="specificFriendsTalkingToFirstLetterImage">{nameOfFriend[0].toUpperCase()}</div>
                     <div className="specificFriendsTalkingTo">{nameOfFriend}</div>
                   </div>
    )
}
export default CurrChattingShowingDivMain