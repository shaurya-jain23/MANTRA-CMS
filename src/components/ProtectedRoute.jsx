import React, {use, useEffect, useState} from 'react'
import {useSelector} from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom';
import { selectUser, selectIsLoggedIn } from '../features/user/userSlice';
import {getDefaultRouteForRole} from '../assets/helperFunctions'
import {Loading} from './index'

function Protected({children, authentication= true,allowedRoles = []}) {
    const navigate = useNavigate();
    const location = useLocation();
    const [loader, setLoader] = useState(true);
    // const [checking, setChecking] = useState(true);
    const isLoggedIn = useSelector(selectIsLoggedIn);
    const userData = useSelector(selectUser);
    
    
    useEffect(()=>{
        if (authentication && !isLoggedIn) {
          navigate("/login", { state: { from: location }, replace: true });
        } else if (!authentication && isLoggedIn) {
          const from = location.state?.from?.pathname || getDefaultRouteForRole(userData.role);
          navigate(from, { replace: true });
        } else if (authentication && isLoggedIn) {
            if (!userData?.profileComplete) {
              navigate("/update-profile", { replace: true });
            }
            else if (userData?.status === "pending") {
              if (location.pathname !== "/pending-approval") {
                navigate("/pending-approval", { replace: true });
              }
            } 
            else if (userData?.status === "active") {
              if (location.pathname === "/pending-approval"){
                const from = location.state?.from?.pathname || getDefaultRouteForRole(userData.role);
                navigate(from, { replace: true });
              }
              else if (allowedRoles?.length > 0 && !allowedRoles.includes(userData.role)) {
                navigate("/unauthorized", { replace: true });
              }
              // else if(!allowedRoles || allowedRoles.length === 0){
              //   navigate("/sales");
              // }
            }
            else if(userData?.status === 'disabled'){
              navigate("/login", { replace: true });
            }
        }
        setLoader(false);
    }, [isLoggedIn, navigate, authentication, userData, allowedRoles, location]);


    if (loader || (authentication && (!isLoggedIn || !userData))) {
      return (<Loading isOpen={loader} message="Loading the Page..." />)
    }

    // Block pending users immediately
    if (userData?.status === "pending" && location.pathname !== "/pending-approval") {
      return null;
    }

    // Block disabled users
    if (userData?.status === "disabled") {
      return null;
    }
    // Block unauthorized roles
    if (
      allowedRoles?.length > 0 &&
      !allowedRoles.includes(userData.role) &&
      userData?.status === "active"
    ) {
      return null;
    }

  return <>{children}</> 
  
}

export default Protected