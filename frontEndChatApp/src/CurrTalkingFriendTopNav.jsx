import { useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import contextForWebsocket from "./websocketContent"


function CurrChattingShowingDivMain({nameOfFriend}){
    const {phoneDisplayGoneOnButtonClick, isDetailSidebarOpen, setIsDetailSidebarOpen, handleRemoveFriend, setIsSelectionModeActive}=useContext(contextForWebsocket)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const navigate=useNavigate()
    
    useEffect(() => {
        if (!isDropdownOpen) return
        const closeDropdown = () => setIsDropdownOpen(false)
        window.addEventListener('click', closeDropdown)
        return () => window.removeEventListener('click', closeDropdown)
    }, [isDropdownOpen])

    const handleMenuClick = (e) => {
        e.stopPropagation()
        if (window.innerWidth <= 600) {
            setIsDropdownOpen(prev => !prev)
        } else {
            setIsDetailSidebarOpen(prev => !prev)
        }
    }
    
    return (
        <div className="topChattingCurrHappening" style={{ position: 'relative' }}>
            <div className="imageANDname">
                     <div className="arrow" onClick={phoneDisplayGoneOnButtonClick}><i className="ri-arrow-left-line"></i></div>
                     <div className="specificFriendsTalkingToFirstLetterImage"><img src="./avtar.svg" style={{width:'100%',height:'100%'}} alt="avatar"></img></div>
                     <div className="specificFriendsTalkingTo">{nameOfFriend}</div>
            </div>
            <div className="DELETEBUTTONFORMESSAGES" onClick={handleMenuClick} style={{ cursor: 'pointer' }}>
                <i className="ri-more-2-fill" style={{ fontSize: '20px', color: '#0F9F91' }}></i>
            </div>
            
            {isDropdownOpen && (
                <div className="mobileHeaderDropdown">
                    <div className="dropdownItem" onClick={() => {
                        handleRemoveFriend()
                        setIsDropdownOpen(false)
                    }}>
                        <i className="ri-user-unfollow-line"></i> Remove Friend
                    </div>
                    <div className="dropdownItem" onClick={() => {
                        setIsSelectionModeActive(true)
                        setIsDropdownOpen(false)
                    }}>
                        <i className="ri-checkbox-multiple-line"></i> Select Messages
                    </div>
                </div>
            )}
        </div>
    )
}
export default CurrChattingShowingDivMain