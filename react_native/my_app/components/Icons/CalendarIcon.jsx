import React from "react";
import Svg, { Rect, Line } from "react-native-svg";

const CalendarIcon = ({ size = 24, fillColor = "#fff", strokeColor = "#fff", strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="3"
      y="5"
      width="18"
      height="16"
      rx="2"
      fill={fillColor}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
    />
    <Line x1="3" y1="9" x2="21" y2="9" stroke={strokeColor} strokeWidth={strokeWidth} />
  </Svg>
);

export default CalendarIcon;
