// src/App.jsx
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux'
import authService from './firebase/auth'
import {login, logout} from "./features/user/userSlice"
import {Footer} from './components'
import {Header} from './components'
import { Outlet } from 'react-router-dom';

function App() {
   const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()

  useEffect(() => {
    authService.getCurrentUser()
      .then((user)=> {
        if(user){
          dispatch(login({
            email: user.email,
            uid: user.uid,
            displayName: user.displayName,
          }))
        } else{
          dispatch(logout())
        }
      })
      .finally(()=> setLoading(false))
  }, [])
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  return (
    <div className="min-h-screen bg-gray-50  flex flex-col">
      <Header/>
      <main className='my-auto'>
         <Outlet /> 
      </main>
      <Footer/>
    </div>
  );
}

export default App;
