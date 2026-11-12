import { LockOpen } from "lucide-react-native";
import PinInput from "../../src/components/PinInput.jsx";
import { router } from "expo-router";
import { isNotRepeatedPIN } from "../../src/utils/pinValidation.js";
import { useState } from "react";
import { log } from "../../src/utils/loggers.js";
const UpdatePin = () => {
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(null)
  const [clearCount, setClearCount] = useState(0)
  
  const goToConfirmPin = (pin) => {
    setError(null)
    setLoading(true)
    // Check if Pin is repeated
    if (!isNotRepeatedPIN(pin)) {
      log("Repeated Pin")
      setError("PIN can't be the same number repeated.")
      setClearCount(c => c + 1)
      setLoading(false)
      return
    }
    setLoading(false)
    router.push({
      pathname: '/pin-reset/ConfirmUpdatePin',
      params: { pin, tabBarHeight: 80 }
    })
  }
    return <PinInput
      icon={<LockOpen size={20} />}
      title="Enter Pin"
      error={error}
      loading={loading}
      onFilled={goToConfirmPin}
      clearCount={clearCount}
    />
}

export default UpdatePin