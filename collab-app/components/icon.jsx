import React from 'react'
import Image from 'next/image'

const Icon = ({src, width, height}) => {
  return (
    <div style={{position: 'relative', width: `${width}`, height: `${height}`, 
                 top: '50%', left: '50%', transform: 'translate(-50%, -50%)'
                }}>
        <Image src={`${src}`} fill style={{objectFit: 'scale-down'}} alt='highlight' priority/>
    </div>
  )
}

export default Icon