// src/App.jsx
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux'
import authService from './firebase/auth'
import {login, logout} from "./features/user/userSlice"
import {Footer, Header, Loading} from './components'
import { Outlet } from 'react-router-dom';

function App() {
   const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()

  useEffect(() => {
    authService.getCurrentUser()
      .then(async(user)=> {
        if(user){
          console.log(user);
          dispatch(login(user))
        } else{
          dispatch(logout())
        }
      })
      .finally(()=> setLoading(false))
  }, [])
  if (loading) {
    return (<Loading isOpen={loading} message="Loading the Page..." />)
  }
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header/>
      <main className="flex-grow flex flex-col justify-center items-center">
         <Outlet /> 
      </main>
      <Footer/>
    </div>
  );
}

export default App;
