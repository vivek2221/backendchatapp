import { useContext } from "react"
import contextForWebsocket from "./websocketContent"

function DisplayCurrFriends({name}){
    const {setCurrTalkingName,setContentTexts}=useContext(contextForWebsocket)
    const  onClickFriend=(e)=>{
      setCurrTalkingName(name)
    }
    return (
        <div className="eachSingleFriends" onClick={onClickFriend}>
          <div className="imageNameFirstLetterEach" style={{position:'absolute',left:'8%',top:'13%'}}>{name[0].toUpperCase()}</div>
          <div style={{position:'absolute',top:'30%',left:'30%' }}>{name}</div>
          <div style={{position:'absolute',top:'30%',left:'90%',fontSize:15,color:'#7171E0'}}>0</div>
          
        </div>
    )
}
export default DisplayCurrFriends