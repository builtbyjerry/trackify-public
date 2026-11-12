// components/products/ProductThumbnail.jsx
import { Image, View, Text, StyleSheet } from 'react-native'
import { getProductInitial, getProductColor } from '../../utils/productUtils'

const ProductThumbnail = ({ name, imageUrl, size = 40 }) => {
  const radius = size * 0.25
  const { background, text } = getProductColor(name)

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[styles.image, { width: size, height: size, borderRadius: radius }]}
      />
    )
  }

  return (
    <View style={[
      styles.initial,
      { width: size, height: size, borderRadius: radius, backgroundColor: background }
    ]}>
      <Text style={[styles.initialText, { color: text, fontSize: size * 0.38 }]}>
        {getProductInitial(name)}
      </Text>
    </View>
  )
}

export default ProductThumbnail

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
  },
  initial: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialText: {
    fontWeight: '600',
  },
})