import { Tabs, useSegments } from "expo-router"
import { useColorScheme } from "react-native"
import { Colors } from "../../src/theme/Color"
import { Ionicons } from "@expo/vector-icons"
import { CartProvider } from "../../src/contexts/CartContext"
import { StatusBar } from "expo-status-bar"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import ProtectedGuard from "../../src/navigation/guards/ProtectedGuard"
import { TransactionSessionProvider } from "../../src/contexts/TransactionSessionContext.jsx";
import { useUser } from "../../src/hooks/useUser.jsx";



const DashboardLayout = () => {
    const { onboardingStatus, authChecked } = useUser()
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    const insets = useSafeAreaInsets()

    const segments = useSegments()
    const isProfileHome = segments.includes("profile") && segments[segments.length - 1] === "profile"
    const isProductsHome = segments.includes("products") && segments[segments.length - 1] === "products"
    const isCartsHome = segments.includes("cart") && segments[segments.length - 1] === "cart"
    const hideTabBar = segments.includes("profile") && !isProfileHome || segments.includes("products") && !isProductsHome || segments.includes("cart") && !isCartsHome

  if (!onboardingStatus || onboardingStatus == null || !authChecked) return null
  return (
    <ProtectedGuard>
        <TransactionSessionProvider>
          <CartProvider>
                <StatusBar style="auto" />

                <Tabs 
                    screenOptions={{
                        headerShown: false,
                        tabBarStyle: { 
                            backgroundColor: theme.background,
                            height: 60 + insets.bottom,
                            paddingBottom: insets.bottom,
                            elevation: 0,
                            display: hideTabBar ? "none" : "flex"
                        },
                        tabBarActiveTintColor: theme.iconColorFocused,
                        tabBarInactiveTintColor: theme.iconColor
                    }}
                >
                    <Tabs.Screen 
                    name="products" 
                    options={{ title: "Products", tabBarIcon: ({ focused }) => (
                    <Ionicons 
                    name={ focused ? "pricetag" : "pricetag-outline"}
                    size={24} 
                    color={focused ? theme.iconColorFocused : theme.iconColor} />) }} />

                    <Tabs.Screen 
                    name="transactions" 
                    options={{ title: "Transactions", tabBarIcon: ({ focused }) => (
                    <Ionicons 
                    name={ focused ? "wallet" : "wallet-outline"} 
                    size={24} 
                    color={focused ? theme.iconColorFocused : theme.iconColor} />) }} />

                    <Tabs.Screen 
                    name="analytics" 
                    options={{ title: "Analytics", tabBarIcon: ({ focused }) => (
                    <Ionicons 
                    name={ focused ? "bar-chart" : "bar-chart-outline"} 
                    size={24} 
                    color={focused ? theme.iconColorFocused : theme.iconColor} />) }} />

                    <Tabs.Screen 
                    name="cart" 
                    options={{ title: "Cart", tabBarIcon: ({ focused }) => (
                    <Ionicons 
                    name={ focused ? "cart" : "cart-outline"} 
                    size={24} 
                    color={focused ? theme.iconColorFocused : theme.iconColor} />) }} />

                    <Tabs.Screen 
                    name="profile" 
                    options={{ title: "Profile", tabBarIcon: ({ focused }) => (
                    <Ionicons 
                    name={ focused ? "person" : "person-outline"}
                    size={24} 
                    color={focused ? theme.iconColorFocused : theme.iconColor} />) }} />


                </Tabs>
          </CartProvider>
        </TransactionSessionProvider>
    </ProtectedGuard>
  )
}

export default DashboardLayout

