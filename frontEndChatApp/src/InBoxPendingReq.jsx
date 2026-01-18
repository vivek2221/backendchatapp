import { useContext, useEffect, useState } from "react"
import PendingRequests from "./PendingRequests"
import contextForWebsocket from "./websocketContent"

function PendingRequestsInbox({onClickFunc}){
    const {ws,name,pendingToMe}=useContext(contextForWebsocket)
    useEffect(()=>{
        if(!ws) return 
        if(ws.readyState===WebSocket.OPEN){
            ws.send(JSON.stringify({kindOf:'pendingReqsForMe',from:name}))
        }
        else{
            ws.onopen=()=>{
         ws.send(JSON.stringify({kindOf:'pendingReqsForMe',from:name}))      
            }
        }
        return ()=>{
            ws.close()
        }
    },[ws])
    return (
        <div id="containerPopUpOFInbox"  onClick={onClickFunc}>
                <div className="pendingRequests" onClick={(e)=>{
                    e.stopPropagation()
                }}>
                    <div className="requestsDiv">Requests</div>
                    <div className="reusablesReqDivs">
                        {pendingToMe.map((ele,index)=>{
                            return <PendingRequests key={index} name={ele}/>
                        })}
                    </div>
                </div>
            </div>
    )
}
export default PendingRequestsInbox