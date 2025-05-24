

import React, { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useStateContext } from '../contexts/ContextProvider'

function AuthLayout() {

  const navigate = useNavigate();

  const {token} = useStateContext();
 

  useEffect(()=>{
    if (token){
      navigate('/dashboard');
    }
  }, []);


  return (
    <div>
      <Outlet/>
    </div>
  )
}

export default AuthLayout
