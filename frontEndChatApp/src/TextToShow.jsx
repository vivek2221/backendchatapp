

import { useContext } from "react"
import contextForWebsocket from "./websocketContent"

function TextToShow({TypeOfWhose, chatText, isDeleted, msgId, onDelete, isSelectionMode, isSelected, onToggleSelect}){
    const {currTalkingName, name: mineName}=useContext(contextForWebsocket)
    
    const showAvatar = () => {
        const initial = TypeOfWhose === 'Mine' 
            ? (mineName ? mineName[0].toUpperCase() : 'M') 
            : (currTalkingName ? currTalkingName[0].toUpperCase() : 'O');
        return (
            <div className="messageAvatar">
                {initial}
            </div>
        );
    }
    
    return (
        <div className={`eachTextDiv ${TypeOfWhose==='Mine'?'mine':'others'} ${isSelectionMode ? 'selection-mode-active' : ''}`}>
            {/* Selection Checkbox */}
            {isSelectionMode && (
                <div className="msgCheckboxContainer visible">
                    <input 
                        type="checkbox" 
                        checked={isSelected} 
                        onChange={() => onToggleSelect(msgId)}
                        className="msgCheckbox"
                    />
                </div>
            )}

            {TypeOfWhose !== 'Mine' && showAvatar()}
            <div 
                className={TypeOfWhose === 'Mine' ? 'mineText' : 'othersText'} 
                style={isDeleted ? { fontStyle: 'italic', color: '#94a3b8' } : {}}
            >
                 <div className="contentForZIndex" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                     {isDeleted ? (
                         <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                             <i className="ri-ban-line" style={{ fontSize: '14px', color: '#94a3b8' }}></i>
                             This message was deleted
                         </span>
                     ) : (
                         <span>{chatText}</span>
                     )}
                 </div>
            </div>
            {TypeOfWhose === 'Mine' && showAvatar()}
        </div>
    )
}
export default TextToShow