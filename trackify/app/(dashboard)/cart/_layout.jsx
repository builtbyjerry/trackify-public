import { Stack } from "expo-router";

export default function CartLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade_from_bottom',
      }}
    />
  )
}