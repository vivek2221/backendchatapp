import { useContext, useEffect, useState } from "react"
import contextForWebsocket from "./websocketContent.jsx"


function AllUsers({name, status}){
    const {ws,name:mineName}=useContext(contextForWebsocket)
    const [localPending, setLocalPending] = useState(status === 'pending_sent')

    // Sync localPending whenever the parent updates the status prop
    // (e.g. after removing a friend the status goes back to 'none')
    useEffect(() => {
        setLocalPending(status === 'pending_sent')
    }, [status])

    const onClickButtonAdd=()=>{
        if (status === 'friend' || status === 'pending_sent' || localPending) return
        setLocalPending(true)
        if(!ws) return 
        if(ws.readyState===WebSocket.OPEN){
            ws.send(JSON.stringify({kindOf:'addReq',from:mineName,to:name}))
        } else {
            ws.onopen=()=>{
                ws.send(JSON.stringify({kindOf:'addReq',from:mineName,to:name}))
            }
        }
    }

    const renderAction = () => {
        if (status === 'friend') {
            return <i className="ri-user-follow-line" style={{ color: '#10b981', fontSize: '18px' }} title="Friends"></i>
        }
        if (status === 'pending_sent' || localPending) {
            return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#64748b', fontWeight: 'normal' }}>
                    <i className="ri-time-line" style={{ fontSize: '16px' }}></i>
                    <span>Pending</span>
                </div>
            )
        }
        if (status === 'pending_received') {
            return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#0f9f91', fontWeight: 'normal' }}>
                    <i className="ri-mail-line" style={{ fontSize: '16px' }}></i>
                    <span>Received</span>
                </div>
            )
        }
        return '+'
    }

    const isClickable = status !== 'friend' && status !== 'pending_sent' && !localPending && status !== 'pending_received';

    return (
        <div className="eachUsersOfAll">
          <div className='addFriendsImageAndNameDiv' >
            <div className="imageNameOfaddFriendsDiv" >{name[0].toUpperCase()}</div>
            <div className="aligningNameInAllUsers">{name}</div>
          </div>
          <div 
            className="newFriendsAddAddButton" 
            onClick={isClickable ? onClickButtonAdd : undefined}
            style={!isClickable ? { cursor: 'default', pointerEvents: 'none' } : {}}
          >
            {renderAction()}
          </div>
        </div>
    )
}
export default AllUsers