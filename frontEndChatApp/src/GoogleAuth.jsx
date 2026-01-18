import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google"
import { useNavigate } from "react-router-dom"

function GoogleAuth(){
  const navigate=useNavigate()

    return (<>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <GoogleLogin
        onSuccess={credentialResponse => {
    fetch(`${import.meta.env.VITE_URL_SERVER}/signUp/GoogleLogin`,{
      method:"PUT",
      headers:{
        'content-type':'application/json'
      },
      body:JSON.stringify({key:credentialResponse.credential}),
      credentials:'include'
    }).then(data=>data.json())
    .then((data)=>{
            if(data.mess==='go'){
                localStorage.setItem("name",data.name)
                navigate('/allChats',{state:{name:data.name}})
            }
        })
  }}
  onError={() => {
    console.log('Login Failed')
  }}
   text="continue_with"
   useOneTap
        />
    </GoogleOAuthProvider>
    </>
    )
}
export default GoogleAuth