// screens/products/EditProducts.jsx

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  View, Text, StyleSheet, Pressable,
  TextInput, FlatList, ActivityIndicator,
  Image
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { router, useFocusEffect } from 'expo-router'
import { ArrowLeft, Search, Plus, Pencil, Package } from 'lucide-react-native'

import { getActiveProducts } from '../../../src/services/productServices.js'
import { groupVariantsByProduct } from '../../../src/utils/productGroupings.js'
import { useToast } from '../../../src/hooks/useToast.jsx';
import {  errorLog } from '../../../src/utils/loggers.js';



const TEAL = '#0F6E56'
const PURPLE = '#635BFF'

const EditProducts = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const { showToast } = useToast()

  const { bottom } = useSafeAreaInsets()

  const showComingSoon = () => {
      showToast({
          title: "Feature coming soon",
          description: "You'll soon be able to view your archived products."
      })
  }

  useEffect(() => {
    fetchProducts()
  }, [])
  useFocusEffect(
    useCallback(() => {
      fetchProducts()
    }, [fetchProducts])
  )

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const data = await getActiveProducts() // your API call here
      const groupedData = groupVariantsByProduct(data)

      setProducts(groupedData)
    } catch (e) {
      errorLog('Failed to fetch products:', e)
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    if (!query.trim()) return products
    const q = query.toLowerCase()
    return products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    )
  }, [query, products])

  const renderProduct = ({ item }) => (
    <View style={styles.productCard}>
      <View style={styles.productHead}>
        <View style={styles.productThumb}>
          {item.image_url
            ? <Image source={ {uri: item.image_url }} style={styles.thumbImage} />/* swap for <Image source={{uri: item.image_url}} /> */
            : <Package size={18} color="#444" />
          }
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          {item.category && <Text style={styles.productCategory}>{item.category}</Text>}
        </View>
        <Pressable
          style={styles.editBtn}
          onPress={() => router.push({ pathname: '/products/EditProduct', params: { id: item.id, variantId: item.variants?.id } })}
        >
          <Pencil size={14} color="#666666" />
        </Pressable>
      </View>

      {item.variants?.map((variant) => (
        <Pressable
          key={variant.id}
          style={({ pressed }) => [styles.variantRow, pressed && styles.variantRowPressed]}
          onPress={() => router.push({
            pathname: '/products/EditSize',
            params: { productId: item.id, variantId: variant.id, imageUrl: item.image_url }
          })}
        >
          <Text style={styles.variantName}>
            {variant.name}
            {variant.units_per_variant > 1 && (
              <Text style={styles.variantCount}> ({variant.units_per_variant} {item.base_unit}s)</Text>
            )}
          </Text>
          <Text style={styles.variantPrice}>
            ₦{Number(variant.sell_price).toLocaleString('en-NG')}
          </Text>
        </Pressable>
      ))}

      <Pressable
        style={styles.addVariantRow}
        onPress={() => router.push({
          pathname: '/products/EditSize',
          params: { productId: item.id }
        })}
      >
        <Plus size={14} color={PURPLE} />
        <Text style={styles.addVariantText}>Add size</Text>
      </Pressable>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.nav}>
        <Pressable onPress={() => router.back()} style={styles.navBack}>
          <ArrowLeft size={16} color="#1a1a1a" />
        </Pressable>
        <Text style={styles.navTitle}>Edit products</Text>
        <Pressable onPress={showComingSoon}>
          <Text style={styles.navArchive}>Archived</Text>
        </Pressable>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Search size={16} color="#999999" />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search products"
            placeholderTextColor="#999999"
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={TEAL} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderProduct}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No products found</Text>
          }
        />
      )}

      <Pressable
        style={[styles.fab, { bottom: 24 + bottom }]}
        onPress={() => router.push('/products/AddProducts')}
      >
        <Plus size={24} color="#fff" />
      </Pressable>
    </SafeAreaView>
  )
}

export default EditProducts

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f5f4',
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
  },
  navBack: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 0.5,
    borderColor: '#e8e8e8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: '#1a1a1a',
    flex: 1,
  },
  navArchive: {
    fontSize: 13,
    color: '#666666',
  },
  searchRow: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    borderWidth: 0.5,
    borderColor: '#e8e8e8',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
    padding: 0,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    gap: 10,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#999999',
    marginTop: 40,
  },
  productCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: '#e8e8e8',
    padding: 12,
    marginBottom: 10,
  },
  productHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  productThumb: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f4f5f4',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  thumbImage: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  productCategory: {
    fontSize: 12,
    color: '#999999',
    marginTop: 1,
  },
  editBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f4f5f4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  variantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 0.5,
    borderTopColor: '#f0f0f0',
  },
  variantRowPressed: {
    backgroundColor: 'rgba(66,179,158,0.05)'
  },

  variantName: {
    fontSize: 13,
    color: '#666666',
  },
  variantCount: {
    fontSize: 11,
    color: '#999999',
  },
  variantPrice: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  addVariantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    paddingBottom: 2,
  },
  addVariantText: {
    fontSize: 12,
    color: PURPLE,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',

    right: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: TEAL,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
})