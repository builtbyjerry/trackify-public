import { Dimensions, FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { AlertCircle, Delete } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { MotiView } from 'moti'
import { log } from '../utils/loggers.js';

const { width } = Dimensions.get("window")
const pinLength = 4
const pinContainerSize = width / 2
const pinMaxSize = pinContainerSize / pinLength
const pinSpacing = 10
const pinSize = pinMaxSize - pinSpacing * 2


const keypad = [1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'del']
const dialPadSize = width * .2
const dialPadTextSize = dialPadSize * .4
const _spacing = 20

function DialPad({ onPress }) {
    return <FlatList
        numColumns={3}
        data={keypad}
        style={{ flexGrow: 0, }}
        scrollEnabled={false}
        columnWrapperStyle={{ gap: _spacing }}
        contentContainerStyle={{ gap: _spacing }}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => {
            return <Pressable
              disabled={item === ''}
              style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1})}
             
              onPress={() => onPress(item)}>
                
                <View 
                  style={{
                    width: dialPadSize,
                    height: dialPadSize,
                    borderRadius: dialPadSize,
                    borderWidth: typeof item !== 'number' ? 0: 1,
                    borderColor: '#3D9E83',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                    {item === 'del' ? <Delete size={dialPadTextSize} /> : <Text style={{ fontSize: dialPadTextSize }}>{item}</Text>}
                </View>
            </Pressable>
        } } 
    />
}

export default function PinInput({ icon, title, error, loading, onFilled, clearCount, isVerifying }) {
    const [pin, setPin] = useState([])
    useEffect(() => {
        if (pin.length === 4) {
            onFilled?.(pin.join(""))
        }
    }, [pin])
    useEffect(() => {
        if (clearCount > 0) setPin([])
    }, [clearCount])
    return (
        
            <View style={styles.container}>
                <View style={styles.header}>
                    <View
                        style={{
                        borderWidth: 1,
                        borderColor: "rgba(0, 0, 0, 0.2)",
                        borderRadius: 10,
                        padding: 10,
                        marginBottom: 20,
                        }}
                    >
                        {icon}
                    </View>
                    <Text style={styles.title}>{title}</Text>
                </View>
                {error && (<View style={styles.error}>
                    <AlertCircle size={15} color="#C0392B" />
                    <Text style={styles.errorText}>{error}</Text>
                </View>)}
                <View style={{ 
                    flexDirection: 'row', 
                    gap: pinSpacing * 2, 
                    marginBottom: _spacing * 2, 
                    height: pinSize * 2, 
                    alignItems: 'flex-end', 
                }}>
                    {[...Array(pinLength).keys()].map(i => {
                        const isSelected = pin[i] !== undefined
                        return <MotiView
                         key={`pin-${i}`}
                         style={{
                            width: pinSize,
                            height: isSelected ? pinSize: 2,
                            borderRadius: pinSize,
                            backgroundColor: '#3D9E83',
                         }}
                         transition={{
                            type: 'timing',
                            duration: isVerifying ? 600 : 200,
                            // stagger each dot's fade by index
                            delay: isVerifying ? i * 150 : 0,
                            loop: isVerifying,                 // keeps pulsing until done
                            repeatReverse: true,
                         }}
                         animate={{
                            height: isSelected ? pinSize: 2,
                            marginBottom: isSelected ? pinSize / 2 : 0,
                            opacity: isVerifying ? 0.3 : 1, 
                         }}
                        />
                    })}
                </View>
                <DialPad
                    onPress={(item) => {
                        log(item)
                        log("PIN: ", pin)
                        if (item === 'del') {
                            setPin(prevPin => prevPin.slice(0, prevPin.length - 1))
                        } else if( typeof item === 'number') {
                            setPin(prevPin => {
                                if (prevPin.length >= pinLength) return prevPin 
                                return [...prevPin, item]
                            })
                        }
                    }} 
                />
            </View>

    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f4f4f4',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    header: {
        alignItems: "center",
        paddingBottom: 18,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        fontStyle: 'italic'
    },
    error: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#FFF0F0',
        borderRadius: 10,
        paddingVertical: 9,
        paddingHorizontal: 12,
        width: '80%',
        // borderWidth: 1,
        // borderColor: '#756563'
    },
    errorText: {
        fontSize: 13,
        color: '#C0392B',
        flex: 1,
    },
})
