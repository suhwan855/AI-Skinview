import React from "react";
import Svg, { Circle, Path } from "react-native-svg";

const UserIcon = ({ size = 24, fillColor = "#fff", strokeColor = "#fff", strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8" r="4" fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />
    <Path
      d="M4 20c0-4 4-6 8-6s8 2 8 6"
      fill={fillColor}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </Svg>
);

export default UserIcon;
