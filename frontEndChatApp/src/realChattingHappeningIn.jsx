import { useContext, useEffect, useRef, useState } from "react"
import CurrChattingShowingDivMain from "./CurrTalkingFriendTopNav"
import TextToShow from "./TextToShow"
import contextForWebsocket from "./websocketContent"


function RealChat(){
    const {currTalkingName,name,ws,contentTexts,setContentTexts,handleDeleteChat,selectedMsgIds,setSelectedMsgIds,isSelectionModeActive,setIsSelectionModeActive}=useContext(contextForWebsocket)
    const [typingContent,setTypingContent]=useState('')
    
    const isSelectionMode = isSelectionModeActive

    const toggleSelectMessage = (msgId) => {
        setSelectedMsgIds(prev => 
            prev.includes(msgId) 
                ? prev.filter(id => id !== msgId) 
                : [...prev, msgId]
        )
    }

    const handleCancelSelection = () => {
        setSelectedMsgIds([])
        setIsSelectionModeActive(false)
    }

    const handleDeleteSelected = (deleteType) => {
        if (selectedMsgIds.length === 0) return
        handleDeleteChat(selectedMsgIds, deleteType)
        setSelectedMsgIds([])
        setIsSelectionModeActive(false)
    }

    const selectedMessages = contentTexts.filter(m => selectedMsgIds.includes(m.id))
    const allSelectedAreMine = selectedMessages.length > 0 && selectedMessages.every(m => m.from === 'Mine')
    const anySelectedIsDeleted = selectedMessages.some(m => m.isDeleted)
    const scrollRef=useRef(null)
    const scrollDown = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }
  useEffect(()=>{
    scrollDown()
  },[contentTexts])
    const onClickButtonToSendText=(e)=>{
        if (!typingContent.trim()) return
        const tempId = Date.now() + Math.random().toString()
        const newMsg = {
            id: tempId,
            from: 'Mine',
            textData: typingContent,
            isDeleted: false,
            tempId: tempId
        }
        setContentTexts((prev)=>([...prev, newMsg]))
        if(!ws) return 
        if(ws.readyState===WebSocket.OPEN){
          ws.send(JSON.stringify({kindOf:'chat',from:name,to:currTalkingName,input:typingContent,tempId:tempId}))
        }
        else{
          ws.onopen=()=>{
            ws.send(JSON.stringify({kindOf:'chat',from:name,to:currTalkingName,input:typingContent,tempId:tempId}))
          }
        }
        setTypingContent('')
        return ()=>{
          ws.close()
        }
    }
    useEffect(()=>{
        if(currTalkingName!=='Viver'){
      fetch(`${import.meta.env.VITE_URL_SERVER}/beginChat/${name}/${currTalkingName}`,{
        method:'GET',
        credentials:'include'
      }).then(data=>data.json())
      .then((data)=>{
        data.arr.sort((a,b)=>(new Date(a.timeAT) - new Date(b.timeAT)))
        let arrr=[]
        data.arr.forEach((ele)=>{
        arrr.push({
            id: ele._id,
            from: `${ele.from===name?'Mine':'others'}`,
            textData: ele.isDeleted ? 'This message was deleted' : ele.msg,
            isDeleted: ele.isDeleted || false,
            timeAt: ele.timeAT
        })   
        })
        setContentTexts([...arrr])
      })}
    },[currTalkingName])
    useEffect(() => {
        setTypingContent('')
        setSelectedMsgIds([])
    }, [currTalkingName])
    if (currTalkingName === 'Viver') {
        return (
            <div className="chattingDiv" style={window.innerWidth <= 600 ? { display: 'none' } : {}}>
                <div className="emptyChatContainer">
                    <h2 className="emptyChatTitle">Ready to go!</h2>
                    <p className="emptyChatSubtitle">Select a connection to start chatting.</p>
                </div>
            </div>
        )
    }
    
    return (
        <div className="chattingDiv">
                   <CurrChattingShowingDivMain nameOfFriend={currTalkingName}/>
                   {isSelectionMode && (
                        <div className="selectionActionBar">
                            <span className="selectionCount">
                                <i className="ri-checkbox-multiple-line"></i> {selectedMsgIds.length} messages selected
                            </span>
                            <div className="selectionActions">
                                <button className="selectionBtn cancel" onClick={handleCancelSelection}>Cancel</button>
                                {allSelectedAreMine && !anySelectedIsDeleted && (
                                    <button className="selectionBtn delete" onClick={() => handleDeleteSelected('everyone')}>
                                        <i className="ri-delete-bin-line"></i> Delete for Everyone
                                    </button>
                                )}
                                <button className="selectionBtn delete" style={{ background: '#64748b' }} onClick={() => handleDeleteSelected('me')}>
                                    <i className="ri-delete-bin-line"></i> Delete for Me
                                </button>
                            </div>
                        </div>
                    )}
                   <div className="currChattingShowingDivMain">
                    <div className="allChatsInDiv" ref={scrollRef}>
                      {contentTexts.map((ele,index)=>{
                        return (
                          <TextToShow 
                            TypeOfWhose={ele.from} 
                            chatText={ele.textData} 
                            isDeleted={ele.isDeleted}
                            msgId={ele.id}
                            onDelete={handleDeleteChat}
                            isSelectionMode={isSelectionMode}
                            isSelected={selectedMsgIds.includes(ele.id)}
                            onToggleSelect={toggleSelectMessage}
                            key={index}
                          />
                        )
                      })}
                    </div>
                    <div className="typingDiv">
                        <input type="text" className="typingInput" placeholder="Type here..." value={typingContent} onKeyDown={(e)=>{
                          if(e.key==='Enter'){
                           onClickButtonToSendText()
                          }}} onChange={(e)=>setTypingContent(e.target.value)}></input>
                          <div className="sendIcon" onClick={onClickButtonToSendText}><i className="ri-send-plane-2-line colorChanging" ></i></div>
                          </div>
                    </div>
                </div>
    )
}
export default RealChat