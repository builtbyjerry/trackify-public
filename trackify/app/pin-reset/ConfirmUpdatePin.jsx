import { LockKeyhole } from "lucide-react-native"
import PinInput from "../../src/components/PinInput.jsx" 
import { savePinToUserProfile } from '../../src/services/onboardingService.js' 
import { router, useLocalSearchParams } from "expo-router"
import { useCallback, useRef, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";


import BottomSheet from '../../src/components/sheet/BottomSheet.jsx'
import PinResetSuccess from '../../src/components/PinResetSuccess.jsx'
import { errorLog, log } from "../../src/utils/loggers.js";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { tokenStorage } from "../../src/utils/tokenStorage.js";
import { OTP_PURPOSES } from "../../src/constants/otpConstants.js";

const ConfirmUpdatePin = () => {

    const ref = useRef()
    const SCREEN_HEIGHT = Dimensions.get('screen').height
    const SNAP_POINT = -(SCREEN_HEIGHT * 0.4)
    const { bottom } = useSafeAreaInsets()

    const { pin: originalPin } = useLocalSearchParams()


    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(null)
    const [clearCount, setClearCount] = useState(0)
    const [isVerifying, setIsVerifying] = useState(false)

    const [sheetOpen, setSheetOpen] = useState(false)

    const openBottomSheet = useCallback(() => {
        if (!ref?.current) {
            log("Ref isn't present")
            return
        }
        ref.current.scrollTo(SNAP_POINT - bottom)
        setSheetOpen(true)
    }, [SNAP_POINT])

    const updatePin = async (pin) => {
        // Check if pin are the same
        setLoading(true)
        setIsVerifying(true)
        if (originalPin !== pin) {
            setError("PIN must match")
            setClearCount(c => c + 1)
            setLoading(false)
            setIsVerifying(false)
            return
        }
        const { token } = await tokenStorage.get(OTP_PURPOSES.PIN_RESET)
        const result = await savePinToUserProfile(pin, { resetToken: token })
         if (result.success) {
            await tokenStorage.clear(OTP_PURPOSES.PIN_RESET)
            openBottomSheet() 
        } else {
            setError(result.error || 'Something went wrong')
            errorLog(result.error)
        }
        setLoading(false)
        setIsVerifying(false)
    }
    return (
        <>
            {sheetOpen && (
                <View style={styles.overlay} />
            )}
            <PinInput 
                icon={<LockKeyhole size={20} />}
                title="Confirm Pin"
                error={error}
                loading={loading}
                onFilled={updatePin}
                clearCount={clearCount}
                isVerifying={isVerifying}
            />
            <BottomSheet ref={ref} sticky showHandle={false} snapPoints={[SNAP_POINT]} backgroundColor="#f4f4f4">
                <PinResetSuccess 
                    onDone={() => {
                        router.replace({
                        pathname: '/(dashboard)/products',
                        params: { pinResetSuccess: true }
                        })
                    }} 
                    visible={sheetOpen}
                />
            </BottomSheet>
        </>
    )

}
const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,  // covers the whole screen
        backgroundColor: 'rgba(0,0,0,0.4)',
        zIndex: 1,
    },
})

export default ConfirmUpdatePin