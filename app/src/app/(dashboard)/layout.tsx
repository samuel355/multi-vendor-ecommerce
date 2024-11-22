import React, { FC, ReactNode } from 'react'

const MainLayout: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className='w-full'>
      {children}
    </div>
  )
}

export default MainLayout
