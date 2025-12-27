import { useState, useEffect, useRef } from 'react';
import { ColorSlider, SliderTrack, SliderOutput, ColorThumb } from "react-aria-components";

const MyColorSlider = ({ label, ...props }) => {

  return (
    <ColorSlider {...props}>
      <SliderTrack
        style={({ defaultStyle }) => ({
          background: `${defaultStyle.background},
            repeating-conic-gradient(#CCC 0% 25%, white 0% 50%) 50% / 16px 16px`,
          borderRadius: '0px',
          border: 'none',
        })}
      >
        <ColorThumb className="bg-black border-2"
                    style={{width: '150%', 
                            aspectRatio: '3/1', left: '50%', 
                            transform: 'translate(-50%, -50%)', 
                            border: 'ridge black',
                          }}/>
      </SliderTrack>
    </ColorSlider>
  );
}

export default MyColorSlider;