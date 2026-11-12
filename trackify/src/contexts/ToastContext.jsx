import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { Animated } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react-native'
import { MinimalToast, StandardToast } from '../theme/ToastVariants.js';

export const ToastContext = createContext()

const TOAST_CONFIG = {
  success: { icon: CheckCircle, iconBg: '#2ECC71', accent: '#2ECC71' },
  warning: { icon: AlertTriangle, iconBg: '#EF9F27', accent: '#EF9F27' },
  error: { icon: XCircle, iconBg: '#E24B4A', accent: '#E24B4A' },
  info: { icon: Info, iconBg: '#378ADD', accent: '#378ADD' },
}

export const ToastProvider = ({ children }) => {
  const insets = useSafeAreaInsets()
  const [toast, setToast] = useState(null)
  const translateY = useRef(new Animated.Value(-100)).current
  const timerRef = useRef(null)

  // Add 'variant' to the destructured arguments (defaulting to 'standard')
  const showToast = useCallback(({ title, description, type = 'success', variant = 'standard' }) => {
    const config = TOAST_CONFIG[type]
    if (timerRef.current) clearTimeout(timerRef.current)
    
    // Save the variant into state
    setToast({ title, description, config, variant })

    Animated.spring(translateY, {
      toValue: insets.top + 10,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start()

    timerRef.current = setTimeout(() => {
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setToast(null))
    }, 3000)
  }, [insets.top])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Instead of hardcoding the UI, we switch based on the requested variant.
        We pass the animation value and the toast data as props.
      */}
      {toast && (() => {
        switch (toast.variant) {
          case 'minimal':
            return <MinimalToast toast={toast} translateY={translateY} />
          case 'standard':
          default:
            return <StandardToast toast={toast} translateY={translateY} />
        }
      })()}
    </ToastContext.Provider>
  )
}