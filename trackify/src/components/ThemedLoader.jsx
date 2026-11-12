import { ActivityIndicator, useColorScheme } from "react-native"
import { Colors } from "../theme/Color"
import ThemedView from "./ThemedView";

const ThemedIndicator = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light

  return( 
    <ThemedView style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    }}>
        <ActivityIndicator size="large" color={theme.text} />
    </ThemedView>
    )
}

export default ThemedIndicator
