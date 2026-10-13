import { ViewStyle } from "react-native";

/** List pages on the website: content in a centred column; the page itself stays full width. */
export const webColumn = (wide: boolean): ViewStyle =>
  wide ? { width: "100%", maxWidth: 1000, alignSelf: "center", paddingHorizontal: 32, paddingVertical: 32 } : { padding: 16 };
