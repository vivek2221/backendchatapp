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

     const toggleDrawer = contextSafe((e)=>{
        setDrawerOpen(prev => !prev)
     })
     const handleRemoveFriend = () => {
        if (!ws || !currTalkingName || currTalkingName === 'Viver') return
        ws.send(JSON.stringify({ kindOf: 'removeFriend', from: name, to: currTalkingName }))
        setCurrTalkingName('Viver')
        setContentTexts([])
        if (window.innerWidth <= 600) {
            phoneDisplayGoneOnButtonClick()
        }
     }
     const handleDeleteChat = (msgIds, deleteType = 'everyone') => {
        if (!ws || !currTalkingName || currTalkingName === 'Viver') return
        const idsArray = Array.isArray(msgIds) ? msgIds : [msgIds]
        ws.send(JSON.stringify({ kindOf: 'deletingChat', msgIds: idsArray, deleteType, from: name, to: currTalkingName }))
     }
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
    const [currTalkingName,setCurrTalkingName]=useState('Viver')
    const [changeState,setChangeState]=useState(0)
    const [pendingToMe,setPendingToMe]=useState([])
    const [allUsersData,setAllUsersData]=useState([])
    const [notification,setNotification]=useState('none')
    const [drawerOpen, setDrawerOpen] = useState(false)
    const settingsDrawerRef = useRef()
    const [allFriendsData,setAllFriendsData]=useState([])
    const [contentTexts,setContentTexts]=useState([])
    const [selectedMsgIds, setSelectedMsgIds] = useState([])
    const [isSelectionModeActive, setIsSelectionModeActive] = useState(false)
    const [isDetailSidebarOpen, setIsDetailSidebarOpen] = useState(false)
    const [unreadCounts, setUnreadCounts] = useState(() => {
        const saved = localStorage.getItem(`unreadCounts_${name}`)
        return saved ? JSON.parse(saved) : {}
    })
    useEffect(() => {
        setSelectedMsgIds([])
        setIsSelectionModeActive(false)
        setIsDetailSidebarOpen(false)
    }, [currTalkingName])
    useEffect(() => {
        if (name) {
            localStorage.setItem(`unreadCounts_${name}`, JSON.stringify(unreadCounts))
        }
    }, [unreadCounts, name])
    useEffect(() => {
        if (currTalkingName && currTalkingName !== 'Viver') {
            setUnreadCounts(prev => {
                if (prev[currTalkingName] === 0) return prev
                return {
                    ...prev,
                    [currTalkingName]: 0
                }
            })
        }
    }, [currTalkingName])
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    useEffect(() => {
        if (!isMobileMenuOpen) return
        const closeMenu = () => setIsMobileMenuOpen(false)
        window.addEventListener('click', closeMenu)
        return () => window.removeEventListener('click', closeMenu)
    }, [isMobileMenuOpen])
    const handleMobileMenuClick = (e) => {
        e.stopPropagation()
        setIsMobileMenuOpen(prev => !prev)
    }
    const [displayOfTextForPhone,setDisplayOfTextForPhone]=useState('none')
    const [webRunFirstTime,setWebRunFirstTime]=useState(0)
    const helper=useRef(currTalkingName)
    useEffect(() => {
    helper.current = currTalkingName
}, [currTalkingName])
    useEffect(() => {
        if (drawerOpen) {
            gsap.killTweensOf(settingsDrawerRef.current)
            gsap.set(settingsDrawerRef.current, { visibility: 'visible' })
            gsap.to(settingsDrawerRef.current, {
                x: 0,
                duration: 0.5,
                ease: 'power3.out'
            })
            gsap.fromTo(
                settingsDrawerRef.current.querySelectorAll('.animate-settings-el'),
                { x: 50, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.4, stagger: 0.08, delay: 0.1, ease: 'power2.out' }
            )
        } else {
            gsap.killTweensOf(settingsDrawerRef.current)
            gsap.to(settingsDrawerRef.current, {
                x: '100%',
                duration: 0.4,
                ease: 'power3.in',
                onComplete: () => {
                    gsap.set(settingsDrawerRef.current, { visibility: 'hidden' })
                }
            })
        }
    }, [drawerOpen])

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
              setContentTexts(prev=>([...prev,{
                  id: msgData.id,
                  from: 'others',
                  textData: msgData.msg,
                  isDeleted: msgData.isDeleted || false
              }]))
            } else {
              setUnreadCounts(prev => ({
                  ...prev,
                  [msgData.from]: (prev[msgData.from] || 0) + 1
              }))
            }
        }
        else if (msgData.kindOf === 'messageSentAck') {
            setContentTexts(prev => prev.map(m => m.tempId === msgData.tempId ? { ...m, id: msgData.id } : m))
        }
        else if (msgData.kindOf === 'chatMessagesDeleted') {
            const deletedIds = msgData.msgIds || []
            const deleteType = msgData.deleteType || 'everyone'
            if (deleteType === 'me') {
                setContentTexts(prev => prev.filter(m => !deletedIds.includes(m.id)))
            } else {
                setContentTexts(prev => prev.map(m => deletedIds.includes(m.id) ? { ...m, isDeleted: true, textData: 'This message was deleted' } : m))
            }
        }
        else if (msgData.kindOf === 'friendRemoved') {
            if (helper.current === msgData.from) {
                setCurrTalkingName('Viver')
                setContentTexts([])
                if (window.innerWidth <= 600) {
                    phoneDisplayGoneOnButtonClick()
                }
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
        <contextForWebsocket.Provider value={{phoneDisplayGoneOnButtonClick,phoneDisplayRealChat,findingSomeOne,setFindingSomeOne,searchingFriends,setSearchingFriends,contentTexts,setContentTexts,currTalkingName,setCurrTalkingName,ws,allFriendsData,name,setChangeState,pendingToMe,changeState,allUsersData,handleDeleteChat,selectedMsgIds,setSelectedMsgIds,isSelectionModeActive,setIsSelectionModeActive,isDetailSidebarOpen,setIsDetailSidebarOpen,handleRemoveFriend,unreadCounts,setUnreadCounts}}>
            <Toaster />
        <div id="allChatsMainDiv" ref={container}>
            <div id="topNavbarDiv">
                <div id="imageLogoTopNavbarDiv" style={{display:'flex',alignItems:'center'}}>
                    <img src="ViverLogo.svg" style={{height:'28px'}} alt="Viver Logo" />
                </div>
                <div id="imageOfNameDiv" title={name}>{name[0].toUpperCase()}</div>
            </div>
            <div id="chattingInfoParentDiv">
                {/* Leftmost thin icon nav bar */}
                <div id="leftIconNavbar">
                    <div className="topNavIcons">
                        <div className="navIcon active" title="Home"><i className="ri-home-5-fill"></i></div>
                        <div className="navIcon" onClick={popUpNewFriendsSearchBox} title="Add Friend"><i className="ri-user-add-line"></i></div>
                        <div className="navIcon pendingIconWrapper" onClick={popUpInbox} title="Pending Requests">
                            <i className="ri-mail-unread-line"></i>
                            <div className="notificationIcon" style={{display:notification}}></div>
                        </div>
                    </div>
                    <div className="bottomNavIcons">
                        <div className="navIcon" onClick={toggleDrawer} title="Settings"><i className="ri-settings-4-line"></i></div>
                    </div>
                </div>
                
                {/* Connections sidebar */}
                <div id="chatsContentDiv">
                    <div className="sidebarTitleRow" style={{ position: 'relative' }}>
                        <h2>Connections</h2>
                        <div className="sidebarMobileMenuBtn" onClick={handleMobileMenuClick} style={{ cursor: 'pointer' }}>
                            <i className="ri-more-2-fill" style={{ fontSize: '20px', color: '#0F9F91' }}></i>
                        </div>
                        {isMobileMenuOpen && (
                            <div className="sidebarMobileDropdown">
                                <div className="dropdownItem" onClick={() => {
                                    toggleDrawer()
                                    setIsMobileMenuOpen(false)
                                }}>
                                    <i className="ri-settings-4-line"></i> Settings
                                </div>
                                <div className="dropdownItem" onClick={() => {
                                    popUpNewFriendsSearchBox()
                                    setIsMobileMenuOpen(false)
                                }}>
                                    <i className="ri-user-add-line"></i> Add Friend
                                </div>
                                <div className="dropdownItem" onClick={() => {
                                    popUpInbox()
                                    setIsMobileMenuOpen(false)
                                }}>
                                    <i className="ri-mail-unread-line"></i> Pending Requests
                                </div>
                            </div>
                        )}
                    </div>
                    <div id="addPlusSearch">
                        <div id="searchChatsWrapper">
                            <SearchChats/>
                            <div id="searchButton"><i className="ri-search-line"></i></div>
                        </div>
                    </div>
                    <div className="separationLineAndFriends">
                        <AllFriends />
                    </div>
                </div>
                
                {/* Chat Panel */}
                <RealChat/>

                {/* Right profile detail sidebar */}
                {currTalkingName !== 'Viver' && isDetailSidebarOpen && (
                    <div id="rightDetailSidebar">
                        <button className="sidebarCloseBtn" onClick={() => setIsDetailSidebarOpen(false)}>
                            <i className="ri-close-line"></i>
                        </button>
                        <div className="rightSidebarAvatarContainer">
                            <div className="rightSidebarAvatar">
                                {currTalkingName[0].toUpperCase()}
                            </div>
                            <span className="onlineStatusDotLarge"></span>
                        </div>
                        <div className="rightSidebarName">{currTalkingName}</div>
                        
                        <div className="rightSidebarActions">
                            <button className="removeFriendBtn" onClick={handleRemoveFriend}>
                                <i className="ri-user-unfollow-line"></i> Remove Friend
                            </button>
                            <button className="selectMessagesBtn" onClick={() => setIsSelectionModeActive(true)}>
                                <i className="ri-checkbox-multiple-line"></i> Select Messages
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <PendingRequestsInbox onClickFunc={popUpInboxClose} />
            <PopUpForAllUsers closePopUp={popUpNewFriendsSearchBoxClose}/>
            
            {/* Settings Drawer */}
            <div id="settingsDrawer" ref={settingsDrawerRef} style={{ transform: 'translateX(100%)' }}>
                <div className="drawerHeader animate-settings-el">
                    <h3>Settings</h3>
                    <button className="drawerCloseBtn" onClick={() => setDrawerOpen(false)}>
                        <i className="ri-close-line"></i>
                    </button>
                </div>
                <div className="drawerProfileSection">
                    <div className="drawerAvatar animate-settings-el">
                        {name ? name[0].toUpperCase() : ''}
                    </div>
                    <h2 className="drawerName animate-settings-el">{name}</h2>
                    <p className="drawerEmail animate-settings-el">Active Member</p>
                </div>

                <div className="drawerFooter animate-settings-el">
                    <button className="drawerLogoutBtn" onClick={(e)=>{
                        fetch(`${import.meta.env.VITE_URL_SERVER}/logout`,{
                            method:'DELETE',
                            credentials:'include'
                        }).then(data=>data.json())
                        .then(data=>{
                            if(data.mess==='reLogin'){
                                navigate('/')
                            }
                        })
                    }}>
                        <i className="ri-logout-box-r-line"></i>
                        <span>Log Out</span>
                    </button>
                </div>
            </div>
        </div>
        </contextForWebsocket.Provider>
    )
}

export default AllChats