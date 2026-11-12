import { Stack } from 'expo-router'
import { AppState } from 'react-native' 
import { StatusBar } from 'expo-status-bar'
import { UserProvider } from '../src/contexts/UserContext'
import { useEffect } from 'react'
import { supabase } from '../src/api/supabase'
import { ToastProvider } from '../src/contexts/ToastContext.jsx'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { KeyboardProvider } from "react-native-keyboard-controller";
import * as Sentry from '@sentry/react-native'
import { log } from '../src/utils/loggers.js';



const RootLayout = () => {
    Sentry.init({
    dsn: 'https://9c90dea8b584142172a39068da7760ef@o4511376439574528.ingest.de.sentry.io/4511376442392656',

    // Adds more context data to events (IP address, cookies, user, etc.)
    sendDefaultPii: true,

    // Enable Logs
    enableLogs: true,

    // Configure Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1,
    integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

    // uncomment the line below to enable Spotlight (https://spotlightjs.com)
    // spotlight: __DEV__,
    });
    log('Sentry initialized')
    // Set up auto refresh when app comes to foreground
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (state) => {
        if (state === 'active') {
            supabase.auth.startAutoRefresh()
        } else {
            supabase.auth.stopAutoRefresh();
        }
        });

        return () => {
        subscription.remove();
        };
    }, []);
    return (
        <KeyboardProvider>
            <ToastProvider>
                <UserProvider>
                    <GestureHandlerRootView style={{ flex: 1 }} >
                        <BottomSheetModalProvider>
                            <StatusBar style="auto" />

                            <Stack screenOptions={{
                                headerShown: false,
                            }}> 
                                <Stack.Screen name='index'/>
                                <Stack.Screen name='(auth)'/>
                                <Stack.Screen name='(dashboard)'/>
                                <Stack.Screen name='onboarding' />
                            </Stack>
                        </BottomSheetModalProvider>
                    </GestureHandlerRootView>
                </UserProvider>
            </ToastProvider>
        </KeyboardProvider>
    )

}

        
        
export default Sentry.wrap(RootLayout);