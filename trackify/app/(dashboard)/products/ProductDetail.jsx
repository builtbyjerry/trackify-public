import { StyleSheet, Text, View, Image, TouchableOpacity, Pressable, Dimensions, ScrollView } from 'react-native'
import { useState } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { useCart } from '../../../src/hooks/useCart.jsx'
import { SafeAreaView } from 'react-native-safe-area-context';
import { getProductInitial, getProductColor } from '../../../src/utils/productUtils.js'
import { useToast } from '../../../src/hooks/useToast.jsx'
import { log } from '../../../src/utils/loggers.js';


const { height } = Dimensions.get('window')
const imageHeight = height * 0.45

const ProductDetail = () => {
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useCart()
  const { showToast } = useToast()

  const { product } = useLocalSearchParams()
  const parsedProduct = JSON.parse(product)
  const { sell_price, products, name, image_url } = parsedProduct


  const decrease = () => {
    if (quantity > 1) setQuantity(quantity - 1)
  }

  const increase = () => {
    setQuantity(quantity + 1)
  }

  const handleAddToCart = () => {
    try {
      addToCart(parsedProduct, quantity)
      log(`${parsedProduct.name} added to the cart with quantity: ${quantity}`)
      showToast({
        title: `${quantity} × ${products.name} added to cart`,
        variant: 'minimal',
      })
    } catch (error) {
      log("Error caught:", error)
    }
  }

  return (
    <SafeAreaView style={styles.container} >
      {/* Product Image */}
      {image_url ? (
        <Image
          source={{ uri: image_url }}
          style={styles.image}
          resizeMode='cover'
        />
      ) : (
        <View style={[styles.image, {
          backgroundColor: getProductColor(products.name).background,
          alignItems: 'center',
          justifyContent: 'center',
        }]}>
          <Text style={{
            fontSize: imageHeight * 0.45,   // scales with the banner height
            fontWeight: '700',
            color: getProductColor(products.name).text,
            opacity: 0.3,
          }}>
            {getProductInitial(products.name)}
          </Text>
        </View>
      )}

      {/* Details */}
      <ScrollView style={styles.details} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{products.name ?? "No name"}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>₦{sell_price ?? "No price"}</Text>
        </View>

        {/* Specs */}
        <View style={styles.specs}>
          <View style={styles.specItem}>
            <Text style={styles.specLabel}>Size</Text>
            <Text style={styles.specValue}>{name ?? "No size"}</Text>
          </View>
          <View style={styles.specItem}>
            <Text style={styles.specLabel}>Category</Text>
            <Text style={styles.specValue}>{products.category ?? "No category"}</Text>
          </View>
        </View>

        {/* Quantity Selector */}
        <View style={styles.qtyRow}>
          <TouchableOpacity style={styles.qtyButton} onPress={decrease}>
            <Text style={styles.qtyButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantity}>{quantity}</Text>
          <TouchableOpacity style={styles.qtyButton} onPress={increase}>
            <Text style={styles.qtyButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Add to Cart */}
        <Pressable style={styles.cartButton} onPress={handleAddToCart}>
          <Text style={styles.cartText}>Add to Cart • ₦{quantity * sell_price}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

export default ProductDetail

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  image: {
    width: "100%",
    height: imageHeight,
    resizeMode: "contain",
    backgroundColor: "#f5f5f5"
  },
  details: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#222"
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  price: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#0a7d4f",
  },
  specs: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginVertical: 14,
  },
  specItem: {
    alignItems: "center",
  },
  specLabel: {
    fontSize: 14,
    color: "#777",
    marginBottom: 4
  },
  specValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333"
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  qtyButton: {
    backgroundColor: "#eee",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  qtyButtonText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333"
  },
  quantity: {
    marginHorizontal: 20,
    fontSize: 20,
    fontWeight: "600",
    color: "#111"
  },
  cartButton: {
    backgroundColor: "#0a7d4f",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginVertical: 20
  },
  cartText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700"
  }
})

