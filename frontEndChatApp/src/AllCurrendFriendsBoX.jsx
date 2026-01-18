import { useContext, useEffect } from "react"
import DisplayCurrFriends from "./DisplayStructureOfCurrFriends.jsx"
import contextForWebsocket from "./websocketContent.jsx"


function AllFriends(){
      const {ws,changeState,searchingFriends,name,allFriendsData}=useContext(contextForWebsocket)
      useEffect(()=>{
        if(!ws)return 
        if(ws.readyState===WebSocket.OPEN){
            ws.send(JSON.stringify({kindOf:'allFriendsToMe',from:name}))
        }
        else {
            ws.onopen=()=>{
                 ws.send(JSON.stringify({kindOf:'allFriendsToMe',from:name}))
            }
        } 
      },[ws])
    return (
            <div id="allCurrFriendsDiv">
                {allFriendsData.length!==0?allFriendsData
                 .filter((ele) => 
                    ele.toLowerCase().includes(searchingFriends.toLowerCase())
                 )
                 .map((ele,index)=>{
                    return <DisplayCurrFriends name={ele} key={index}/>
                }) : <div style={{width:'50%',height:"100%",display:'flex',alignItems:'center',justifyContent:'center'}}>no curr friends</div>}
            </div>
    )
}
export default AllFriends