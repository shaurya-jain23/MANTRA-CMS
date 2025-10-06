import React from 'react'

function Container({children}) {
  return (
    <div className="w-full flex flex-col justify-center items-center px-2 py-10 sm:px-5 md:px-10 lg:px-15 xl:px-22 space-y-6">
        {children}
    </div>
  )
}

export default Container