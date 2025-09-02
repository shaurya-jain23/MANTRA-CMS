import React from 'react'

function Container({children}) {
  return (
    <div className="w-full flex flex-col justify-center items-center px-5 py-10 sm:px-10 md:px-20 lg:px-30 space-y-6">
        {children}
    </div>
  )
}

export default Container