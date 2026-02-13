import { useGSAP } from "@gsap/react"
import SearchChats from "./searchChats"
import {  useEffect, useRef, useState } from "react"
import gsap from 'gsap'
import PopUpForAllUsers from "./PopUpForAllUsers"
import contextForWebsocket from "./websocketContent"
import PendingRequestsInbox from "./InBoxPendingReq"
import AllFriends from "./AllCurrendFriendsBoX"
import toast, { Toaster } from 'react-hot-toast';
import RealChat from "./realChattingHappeningIn"
import { useNavigate } from "react-router-dom"


const notify = (mess) => toast(mess);
function AllChats(){
    const container=useRef()
     const navigate=useNavigate()
     const {contextSafe}=useGSAP({scope:container})
     const popUpInbox=contextSafe((e)=>{
         gsap.to('#containerPopUpOFInbox',{
            display:"flex",
            duration:0.3
         })
         setNotification('none')
         
     })
     const phoneDisplayRealChat=contextSafe((e)=>{
        gsap.to('.chattingDiv',{
            display:'block',
        })
     })
     const phoneDisplayGoneOnButtonClick=contextSafe((e)=>{
        gsap.to('.chattingDiv',{
            display:'none'
        })
     })
     const popUpInboxClose=contextSafe((e)=>{
        gsap.to('#containerPopUpOFInbox',{
            display:'none',
            duration:0.2
         })
     })
     const popUpNewFriendsSearchBox=contextSafe((e)=>{
        gsap.to('#containerPopUpOfNewFriends',{
            display:'flex',
            duration:0.3,
        })
     })
     const popUpNewFriendsSearchBoxClose=contextSafe((e)=>{
        gsap.to('#allChatsMainDiv #containerPopUpOfNewFriends',{
            display:'none',
            duration:0.3,
        })
     })
    //  main logic from here   
    const [name, setName] =useState(()=>{
        return localStorage.getItem('name')
    })
    const [ws,setWs]=useState()
    const [searchingFriends,setSearchingFriends]=useState('')
    const [findingSomeOne,setFindingSomeOne]=useState('')
    const [currTalkingName,setCurrTalkingName]=useState('Whisper')
    const [changeState,setChangeState]=useState(0)
    const [pendingToMe,setPendingToMe]=useState([])
    const [allUsersData,setAllUsersData]=useState([])
    const [notification,setNotification]=useState('none')
    const [allFriendsData,setAllFriendsData]=useState([])
    const [contentTexts,setContentTexts]=useState([])
    const [displayOfTextForPhone,setDisplayOfTextForPhone]=useState('none')
    const [webRunFirstTime,setWebRunFirstTime]=useState(0)
    const helper=useRef(currTalkingName)
    useEffect(() => {
    helper.current = currTalkingName
}, [currTalkingName])
    useEffect(()=>{
    let socket=new WebSocket(import.meta.env.VITE_WEBSOCKET_URL)
    socket.onopen=()=>{
       setWs(socket) 
    }
    socket.onmessage=(msg)=>{
        const msgData=JSON.parse(msg.data)
        if(msgData.kindOf==='allFriendsToMe'){
           setAllFriendsData(msgData.data)
        }
        else if(msgData.kindOf==='pendingsToMe'){
            setPendingToMe(msgData.data)
            if(webRunFirstTime!=0){
            setNotification('flex')
            setWebRunFirstTime(1)
        }
        }
        else if(msgData.kindOf==='allUsersData'){
           setAllUsersData(msgData.data)
        }
        else if(msgData.errMess){
         notify(msgData.errMess)
        }
        else if(msgData.kindOf==='chatMessage'){
            if(msgData.from===helper.current){
              setContentTexts(prev=>([...prev,{from:'others',textData:msgData.msg}]))
            }
        }
        else if(msgData.kindOf==='reLogin'){
            fetch(`${import.meta.env.VITE_URL_SERVER}/logout`,{
                method:'DELETE',
                credentials:'include'
            })
            navigate('/')
        }
    }
    return () => {
    socket.close()
  }
    },[])
    return (
        <contextForWebsocket.Provider value={{phoneDisplayGoneOnButtonClick,phoneDisplayRealChat,findingSomeOne,setFindingSomeOne,searchingFriends,setSearchingFriends,contentTexts,setContentTexts,currTalkingName,setCurrTalkingName,ws,allFriendsData,name,setChangeState,pendingToMe,changeState,allUsersData}}>
            <Toaster />
        <div id="allChatsMainDiv"  ref={container}>
            <div id="topNavbarDiv">
                <div id="imageLogoTopNavbarDiv"><img src="whisperLogo.png" style={{width:'100%',height:'100%'}}></img></div>
                <div id="imageOfNameDiv">{name[0].toUpperCase()}</div>
            </div>
            <div id="chattingInfoParentDiv">
                <div id="chatsContentDiv">
                    <div id="addPlusSearch">
                        <div id="addPeopleButton" onClick={popUpNewFriendsSearchBox}>
                            <i className="ri-user-add-line"></i>
                            </div>
                        <SearchChats/>
                        <div id="searchButton"><i className="ri-search-line"></i></div>
                    </div>
                    <div className="separationLineAndFriends">
                        <div className="separationLine"></div>
                        <AllFriends />
                        <div className="inBoxDiv" onClick={popUpInbox}>
                            <i className="ri-mail-unread-line"></i>
                            <div className="notificationIcon" style={{display:notification}}></div>
                            </div>
                    </div>
                </div>
                <RealChat/>
            </div>
            <PendingRequestsInbox onClickFunc={popUpInboxClose} />
            <PopUpForAllUsers closePopUp={popUpNewFriendsSearchBoxClose}/>
        </div>
        </contextForWebsocket.Provider>
    )
}

export default AllChats