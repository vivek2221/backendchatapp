import { useContext } from "react"
import contextForWebsocket from "./websocketContent"

function DisplayCurrFriends({name}){
    const {setCurrTalkingName,phoneDisplayRealChat,setContentTexts}=useContext(contextForWebsocket)
    const  onClickFriend=(e)=>{
      setCurrTalkingName(name)
      phoneDisplayRealChat()
    }
    return (
        <div className="eachSingleFriends" onClick={onClickFriend}>
          <div className="imageNameFirstLetterEach" style={{position:'absolute',left:'3%',top:'13%',border:'1px solid black'}}><img src="./forAll.svg" style={{width:'100%',height:'100%'}} alt="avatar"></img></div>
          <div style={{position:'absolute',top:'30%',left:'16%' }}>{name}</div>
          <div style={{position:'absolute',top:'30%',left:'90%',fontSize:15,color:'#7171E0'}}>0</div>
          
        </div>
    )
}
export default DisplayCurrFriends