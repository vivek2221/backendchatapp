import { useContext, useState } from "react"
import contextForWebsocket from "./websocketContent.jsx"


function AllUsers({name}){
    const {ws,name:mineName}=useContext(contextForWebsocket)
    const [iconAdd,setIconAdd]=useState('+')
const onClickButtonAdd=()=>{
    setIconAdd('-')
    if(!ws) return 
    if(ws.readyState===WebSocket.OPEN){
    ws.send(JSON.stringify({kindOf:'addReq',from:mineName,to:name}))
  }

    else{
      ws.onopen=()=>{
        ws.send(JSON.stringify({kindOf:'addReq',from:mineName,to:name}))
      }
    }
}
    return (
        <div className="eachUsersOfAll">
          <div className='addFriendsImageAndNameDiv' >
            <div className="imageNameOfaddFriendsDiv" >{name[0].toUpperCase()}</div>
            <div className="aligningNameInAllUsers">{name}</div>
          </div>
          <div className="newFriendsAddAddButton" onClick={onClickButtonAdd}>{iconAdd}</div>
        </div>
    )
}
export default AllUsers