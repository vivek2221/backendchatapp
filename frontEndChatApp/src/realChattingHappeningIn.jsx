import { useContext, useEffect, useRef, useState } from "react"
import CurrChattingShowingDivMain from "./currTalkingFriendTopNav"
import TextToShow from "./TextToShow"
import contextForWebsocket from "./websocketContent"


function RealChat(){
    const {currTalkingName,name,ws,contentTexts,setContentTexts}=useContext(contextForWebsocket)
    const [typingContent,setTypingContent]=useState('')
    const scrollRef=useRef(null)
    const scrollDown = () => {
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }
  useEffect(()=>{
    scrollDown()
  },[contentTexts])
    const onClickButtonToSendText=(e)=>{
        setContentTexts((prev)=>([...prev,{from:'Mine',textData:typingContent}]))
        if(!ws) return 
        if(ws.readyState===WebSocket.OPEN){
          ws.send(JSON.stringify({kindOf:'chat',from:name,to:currTalkingName,input:typingContent}))
        }
        else{
          ws.onopen=()=>{
            ws.send(JSON.stringify({kindOf:'chat',from:name,to:currTalkingName,input:typingContent}))
          }
        }
        setTypingContent('')
        return ()=>{
          ws.close()
        }
    }
    useEffect(()=>{
        if(currTalkingName!=='Whisper'){
      fetch(`${import.meta.env.VITE_URL_SERVER}/beginChat/${name}/${currTalkingName}`,{
        method:'GET',
        credentials:'include'
      }).then(data=>data.json())
      .then((data)=>{
        data.arr.sort((a,b)=>(new Date(a.timeAT) - new Date(b.timeAT)))
        let arrr=[]
        data.arr.forEach((ele)=>{
        arrr.push({from:`${ele.from===name?'Mine':'others'}`,textData:ele.msg})   
        })
        setContentTexts([...arrr])
      })}
    },[currTalkingName])
    
    return (
        <div className="chattingDiv">
                   <CurrChattingShowingDivMain nameOfFriend={currTalkingName}/>
                   <div className="currChattingShowingDivMain">
                    <div className="allChatsInDiv" ref={scrollRef}>
                      {contentTexts.map((ele,index)=>{
                        return <TextToShow TypeOfWhose={ele.from} chatText={ele.textData} key={index}/>
                      })}
                    </div>
                    <div className="typingDiv">
                        <input type="text" className="typingInput" placeholder="Type here..." value={typingContent} onKeyDown={(e)=>{
                          if(e.key==='Enter'){
                           onClickButtonToSendText()
                          }}} onChange={(e)=>setTypingContent(e.target.value)}></input></div>
                        <div className="sendIcon" onClick={onClickButtonToSendText}><i className="ri-send-plane-2-line"></i></div>
                    </div>
                </div>
    )
}
export default RealChat