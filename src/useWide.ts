import { Platform, useWindowDimensions } from "react-native";

/** Desktop/tablet browser window: switch to the website layout (top menu, two columns). */
export const WIDE_MIN = 900;
export const useWide = () => {
  const { width } = useWindowDimensions();
  return Platform.OS === "web" && width >= WIDE_MIN;
};
