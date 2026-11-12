import { Dimensions } from 'react-native'
import { View } from 'react-native'
import { MotiView } from 'moti'

const { width } = Dimensions.get('window')
const pinContainerSize = width / 2
const PIN_LENGTH = 4
const pinSpacing = 10
const pinSize = (pinContainerSize / PIN_LENGTH) - pinSpacing * 2
const _spacing = 20

const PinDots = ({ 
  length, 
  error = false, 
  isVerifying = false,
}) => (
  <View style={{
    flexDirection: 'row',
    gap: pinSpacing * 2,
    height: pinSize * 2,
    alignItems: 'flex-end',
    marginBottom: _spacing * 2,
  }}>
    {Array.from({ length: PIN_LENGTH }).map((_, i) => {
      const isSelected = i < length
      return (
        <MotiView
          key={`pin-${i}`}
          style={{
            width: pinSize,
            borderRadius: pinSize,
            backgroundColor: error
              ? '#FF3B30'
              : isSelected
                ? '#2ECC71'
                : '#e0e0e0',
          }}
          animate={{
            height: isSelected ? pinSize : 2,
            marginBottom: isSelected ? pinSize / 2 : 0,
            opacity: isVerifying ? 0.3 : 1,
          }}
          transition={{
            height: {
              type: 'timing',
              duration: 200,    // just animates once, no loop
            },
            marginBottom: {
              type: 'timing',
              duration: 200,    // same
            },
            opacity: {
              type: 'timing',
              duration: isVerifying ? 600 : 200,
              delay: isVerifying ? i * 150 : 0,
              loop: isVerifying,          // only opacity loops
              repeatReverse: true,
            },
          }}
        />
      )
    })}
  </View>
)

export default PinDots