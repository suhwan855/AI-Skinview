import React from "react";
import Svg, { Rect, Path, Circle } from "react-native-svg";

const CameraIcon = ({ size = 24, fillColor = "transparent", strokeColor = "#fff", strokeWidth = 3 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="7" width="18" height="14" rx="2" fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />
    <Path d="M7 7L9 4h6l2 3" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round"/>
    <Circle cx="12" cy="14" r="3" fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth}/>
  </Svg>
);

export default CameraIcon;
