import React, {useEffect, useState} from 'react'
import {useSelector} from 'react-redux'
import {useNavigate} from 'react-router-dom';


function Protected({children, authentication= true}) {
    const navigate = useNavigate();
    const [loader, setLoader] = useState(true);
    const userStatus = useSelector((state) => state.user.status);

    useEffect(()=>{
        if(authentication && userStatus !== authentication){
            navigate("/login");
        } else if(!authentication && userStatus !== authentication){
            navigate("/");
        }
        setLoader(false);
    }, [userStatus, navigate, authentication]);
  return (
    loader? <h1>Loading...</h1> : <>{children}</> 
  )
}

export default Protected