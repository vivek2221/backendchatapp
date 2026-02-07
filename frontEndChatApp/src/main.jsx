import {createBrowserRouter,RouterProvider} from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import SubLogin from './SubmitLogin.jsx'
import './Main.css'
import AllChats from './AllChats.jsx'
const root=createRoot(document.querySelector('#root'))
const routes=createBrowserRouter([
  {
    path:'/',
    element:<SubLogin Type='signIn'/>
  },
  {
    path:'/signIn',
    element:<SubLogin Type='login'/>
  },
  {
    path:'/allChats',
    element:<AllChats/>
  }
])
root.render(<RouterProvider router={routes}/>)