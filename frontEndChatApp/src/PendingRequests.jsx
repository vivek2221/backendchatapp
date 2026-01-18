import { useContext } from "react"
import contextForWebsocket from "./websocketContent"



function PendingRequests({name}){
    const {name:to,ws,setChangeState}=useContext(contextForWebsocket)
    const onclickCross=(e)=>{
       fetch(`${import.meta.env.VITE_URL_SERVER}/rejectReq`,{
        method:'DELETE',
        headers:{
            'content-type':"application/json"
        },
        credentials:'include',
        body:JSON.stringify({to,from:name})
       })
       .then(data=>data.json())
       .then(data=>{
        if(data.mess==='done'){
            setChangeState(prev=>prev+1) 
        if(ws.readyState===WebSocket.OPEN){
            ws.send(JSON.stringify({kindOf:'pendingReqsForMe',from:to}))
        }
        else{
            ws.onopen=()=>{
         ws.send(JSON.stringify({kindOf:'pendingReqsForMe',from:to}))      
            }
        }
        }
       })
    }
    const onClickTick=(e)=>{
        if(ws.readyState===WebSocket.OPEN){
            ws.send(JSON.stringify({kindOf:'ack',from:name,to}))
            ws.send(JSON.stringify({kindOf:'pendingReqsForMe',from:to}))    
         }
        else{
            ws.onopen=()=>{
                ws.send(JSON.stringify({kindOf:'ack',from:name,to}))
                ws.send(JSON.stringify({kindOf:'pendingReqsForMe',from:to}))
            }
        }
    }
    return (
        <div className="eachRequestDiv">
            <div style={{display:'flex',alignItems:'center',justifyContent:"space-evenly",width:'40%'}}>
                <div className="imageDivRequest">{name[0].toUpperCase()}</div>
                <div className="nameRequestDiv">{name}</div>
            </div>
            <div style={{display:'flex',alignItems:'center',justifyContent:"space-evenly",width:'40%'}}>
                <div className="cross" onClick={onclickCross}><i className="ri-close-line"></i></div>
                <div className="tick" onClick={onClickTick}><i className="ri-check-line"></i></div>
            </div>
            
        </div>
    )
}
export default PendingRequests