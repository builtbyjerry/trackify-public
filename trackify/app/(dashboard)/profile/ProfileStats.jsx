import { TextInput } from 'react-native-gesture-handler';


const ProfileStats = () => {
  const [a, setA] = useState('')
  const [b, setB] = useState('')
  return (
    <View style={{ padding: 40 }}>
      <TextInput value={a} onChangeText={setA} placeholder="A" />
      <TextInput value={b} onChangeText={setB} placeholder="B" />
    </View>
  )
}

export default ProfileStats