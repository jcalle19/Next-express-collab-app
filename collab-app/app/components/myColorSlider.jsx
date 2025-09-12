import { ColorSlider, SliderTrack, ColorThumb } from "react-aria-components";

const MyColorSlider = ({ label, ...props }) => {
  return (
    <ColorSlider {...props}>
      <SliderTrack
        style={({ defaultStyle }) => ({
          background: `${defaultStyle.background},
            repeating-conic-gradient(#CCC 0% 25%, white 0% 50%) 50% / 16px 16px`,
        })}
      >
        <ColorThumb className="bg-black border-2 border-white"
                    style={{width: '100%', height: '10%', left: '50%', transform: 'translate(-50%, -50%)'}}/>
      </SliderTrack>
    </ColorSlider>
  );
}

export default MyColorSlider;