import * as Crypto from 'expo-crypto'

export const isNotRepeatedPIN = (pin) => {
    return !pin.split("").every(digit => digit === pin[0])
}