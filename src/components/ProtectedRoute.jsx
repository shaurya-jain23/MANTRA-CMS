import React, {use, useEffect, useState} from 'react'
import {useSelector} from 'react-redux'
import { useNavigate, Outlet } from 'react-router-dom';
import { selectUser, selectIsLoggedIn } from '../features/user/userSlice';

function Protected({children, authentication= true,allowedRoles = []}) {
    const navigate = useNavigate();
    const [loader, setLoader] = useState(true);
    const isLoggedIn = useSelector(selectIsLoggedIn);
    const userData = useSelector(selectUser);
    
    useEffect(()=>{
        // if(authentication && userStatus !== authentication){
        //     navigate("/login");
        // } else if(!authentication && userStatus !== authentication){
        //     navigate("/");
        // }
        if (authentication && !isLoggedIn) {
          // Needs authentication but user not logged in → go login
          navigate("/login");
        } else if (!authentication && isLoggedIn) {
          // Page like /login or /signup when already logged in → redirect to dashboard
          navigate("/dashboard");
        } else if (authentication && isLoggedIn) {
          // User logged in, now check their status
          if (userData?.status === "pending") {
            navigate("/pending-approval");
          } else if (userData?.status === "active") {
              if (allowedRoles.length > 0 && !allowedRoles.includes(userData.role)) {
                navigate("/unauthorized");
              }
          } else if(userData?.status === 'disabled'){
            // fallback (unknown status, block access)
            navigate('/login');
          }
        }
        setLoader(false);
    }, [isLoggedIn, navigate, authentication, userData]);
  return (
    loader? <h1>Loading...</h1> : <>{children}</> 
  )
}

export default Protected