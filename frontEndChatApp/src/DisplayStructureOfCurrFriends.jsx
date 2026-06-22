import { useContext } from "react"
import contextForWebsocket from "./websocketContent"

function DisplayCurrFriends({name}){
    const {currTalkingName,setCurrTalkingName,phoneDisplayRealChat,unreadCounts}=useContext(contextForWebsocket)
    const  onClickFriend=(e)=>{
      setCurrTalkingName(name)
      phoneDisplayRealChat()
    }
    const isActive = currTalkingName === name;
    const unreadCount = unreadCounts?.[name] || 0;

    return (
        <div className={`eachSingleFriends ${isActive ? 'active' : ''}`} onClick={onClickFriend}>
          <div className="avatarContainer">
            <div className="imageNameFirstLetterEach">
              <img src="./forAll.svg" alt="avatar"></img>
            </div>
            <span className="onlineStatusDot"></span>
          </div>
          <div className="friendName">{name}</div>
          {unreadCount > 0 && <div className="friendBadge">{unreadCount}</div>}
        </div>
    )
}
export default DisplayCurrFriends