import { useContext, useEffect, useState } from "react"
import AllUsers from "./AllUsers.jsx"
import contextForWebsocket from "./websocketContent.jsx"



function PopUpForAllUsers({closePopUp}){
        const {name,allUsersData,findingSomeOne,setFindingSomeOne,ws}=useContext(contextForWebsocket)
        useEffect(()=>{
            if(!ws) return 
            if(ws.readyState===WebSocket.OPEN){
                ws.send(JSON.stringify({kindOf:'allUsersData',mineName:name}))}
            else{
                ws.onopen=()=>{
                ws.send(JSON.stringify({kindOf:'allUsersData',mineName:name}))
                 }
                }
            return ()=>{
                ws.close()
            }
        },[ws])
        
    return (
       <div id="containerPopUpOfNewFriends" onClick={closePopUp}>
                <div className="addRequestBoxDiv" onClick={(e)=>e.stopPropagation()}>
                    <div className="addNameNameDiv">Add Friends</div>
                    <div className="searchNewFriends">
                        <input className="inputSearchForNewFriends" type="text" value={findingSomeOne} placeholder="Search" onChange={(e)=>{
                            setFindingSomeOne(e.target.value)
                        }}></input>
                    </div>
                    <div className="blackLineAfterSearchBox"></div>
                    <div className="newFriendsActualDiv">
                        {allUsersData.filter((ele) => 
                            ele.toLowerCase().includes(findingSomeOne.toLowerCase())
                        ).map((ele,index)=>{
                            return <AllUsers key={index} name={ele}/>
                        })}
                    </div>
                </div>
            </div>
    )
}
export default PopUpForAllUsers