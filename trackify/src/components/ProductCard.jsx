import React, { useCallback } from 'react'
import { 
  View,
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  useColorScheme
} from 'react-native'
import { Colors } from '../theme/Color'
import { getProductColor, getProductInitial } from '../utils/productUtils.js';

const { width } = Dimensions.get('window')
const cardWidth = (width - 48) / 2;

const ProductCard = React.memo(({ product, onProductPress, onAddToCart}) => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    const handlePress = useCallback(() => {
    onProductPress(product)
  }, [onProductPress, product]);

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* Product Image */}
      <View style={styles.imageContainer}>
        {product.image_url ? (
          <Image
            source={{ uri: `${product.image_url}?v=${product.imageVersion}` }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, {
            backgroundColor: getProductColor(product.products.name).background,
            alignItems: 'center',
            justifyContent: 'center',
          }]}>
            <Text style={{
              fontSize: 48,
              fontWeight: '700',
              color: getProductColor(product.products.name).text,
              opacity: 0.4,
            }}>
              {getProductInitial(product.products.name)}
            </Text>
          </View>
        )}
        {/* Size Badge */}
        <View style={[styles.sizeBadge, { backgroundColor: '#42B39E' }]}>
          <Text style={styles.sizeText}>{product.name}</Text>
        </View>
      </View>
      
      {/* Product Info */}
      <View style={styles.infoContainer}>
        <Text 
          style={styles.productName} 
          numberOfLines={2}
        >
          {product.products.name}
        </Text>

        <Text style={[styles.price, { color: '#3d9e83ff' }]}>
          ₦{product.sell_price}
        </Text>
        
        {/* Checkout Button */}
        <View style={{ marginTop: 'auto' }}>
        <TouchableOpacity 
          style={[styles.checkoutButton, { backgroundColor: '#42B39E' }]}
          onPress={() => onAddToCart && onAddToCart(product)}
          activeOpacity={0.7}
        >
          <Text style={styles.checkoutText}>Add to Cart</Text>
        </TouchableOpacity>
        </View>
      </View>
      
      {/* Subtle gradient overlay for depth */}
      <View style={styles.overlay} />
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    flex: 1,
    height: '100%',
    backgroundColor: '#F4FBF9',
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 160,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F8F9FA',
  },
  sizeBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',

  },
  sizeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  infoContainer: {
    padding: 16,
    paddingBottom: 8,
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 20,
    color: '#19183B'
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  checkoutButton: {
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  checkoutText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    backgroundColor: '#E7F2EF05'
  },
});


export default ProductCard;