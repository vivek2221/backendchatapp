import contextForWebsocket from "./websocketContent"
import { useContext } from "react"


function SearchChats(){

   const {searchingFriends,setSearchingFriends}=useContext(contextForWebsocket)

    return (
        <input type="text" id="searchingChats" value={searchingFriends} placeholder="search" onChange={(e)=>{
          setSearchingFriends(e.target.value)
        }}>
        </input>
    )
}
export default SearchChats