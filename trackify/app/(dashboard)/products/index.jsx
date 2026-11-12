import { useState, useEffect, useCallback } from 'react'
import { View, StyleSheet, Image, Text, TextInput, ActivityIndicator, Pressable, RefreshControl } from 'react-native'
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from "@shopify/flash-list"


import { useUser } from '../../../src/hooks/useUser'
import ProductCard from '../../../src/components/ProductCard'
import { useCart } from '../../../src/hooks/useCart'
import { getActiveProducts } from '../../../src/services/productServices.js'
import { clearProductsDirty, isProductsDirty } from '../../../src/store/productStore.js';
import { useToast } from '../../../src/hooks/useToast.jsx'
import { errorLog, log } from '../../../src/utils/loggers.js';



const Products = () => {
  const router = useRouter()
  const { employee } = useUser()
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const { addToCart } = useCart()
  const { showToast } = useToast()


  useEffect(() => {
    fetchProducts(true)
  }, [])
  useFocusEffect(
    useCallback(() => {
      fetchProducts()
    }, [fetchProducts])
  )

  useEffect(() => {
    if (searchQuery) {
      const filtered = products.filter(product => 
        product.products.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        (product.products.category?.toLowerCase() || "").includes(searchQuery.toLowerCase().trim()) // Not every product has a category, so we need to safeguard lest the program breaks
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchQuery, products]);

  const fetchProducts = async (force = false) => {
    log('fetchProducts called — force:', force, '| isDirty:', isProductsDirty())
    if (!force && !isProductsDirty()) {
       log('Skipping fetch — not dirty')
       return
    } // ← skip if nothing changed
    try {
      setLoading(true);
      const data = await getActiveProducts()
      // inject imageVersion on every fetch so RN's image cache is busted
      const withVersion = data.map(p => ({ ...p, imageVersion: Date.now() }))
      setProducts(withVersion)
      setFilteredProducts(withVersion)
      clearProductsDirty()
      log("After clearing dirty products, product dirty state:", isProductsDirty())
      log('Fetch complete, dirty cleared')
    } catch (error) {
      errorLog('Error fetching products:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProductPress = (product) => {
    router.push({
      pathname: "/(dashboard)/products/ProductDetail",
      params: {
        product: JSON.stringify(product)
      }
    })
  }
  const handleAddToCart = (product) => {
    try {
      addToCart(product)
      showToast({
        title: `${product?.products?.name} added to cart successfully`,
        variant: 'minimal',
      })

    } catch (error) {
      errorLog("Error caught:", error)
    }
  }

  const renderProduct = ({ item, index }) => { 
    // Determine if it's the left or right column
    const isLeftColumn = index % 2 === 0
    return (
      <View style={[
        styles.itemWrapper, 
        isLeftColumn ? styles.leftItem : styles.rightItem
      ]}>
        <ProductCard
          product={item}
          onProductPress={handleProductPress}
          onAddToCart={handleAddToCart}
        />
      </View>
    )
  }

  const EmptyList = () => {
    return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyState}>{searchQuery ? 'No items matched this search' : 'No products yet. Add your first product' }</Text>
    </View>
    )
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} >
      {/* Navigation Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Hi, {employee?.display_name}
        </Text>
          <Pressable 
            style={({ pressed }) => [
              styles.profileIcon, pressed && styles.pressed]}
              onPress={() => router.push('/profile')}>
              <Image style={styles.profileImage} source={{ uri: `${employee?.profile_url}?v=${employee?.imageVersion}`, cache: "reload"}}/>
          </Pressable>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Products Grid */}
      <FlashList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={EmptyList}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => fetchProducts(true)}
            tintColor='#000100'
            colors={['#42B39E']}
          />
        }
      />
    </SafeAreaView>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E7F2EF',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 26,
    paddingVertical: 12,
    backgroundColor: '#E7F2EF',
    borderBottomColor: '#E0E0E0',
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
  },
   profileIcon: {
    borderColor: '#42B39E',
    borderWidth: 5,
    borderRadius: 22,
    width: 44, 
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    borderColor: '#6366F1'
  },

  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  listContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
    paddingTop: 16,
  },
  itemWrapper: {
    marginBottom: 16,
    flex: 1,
  },
  leftItem: {
    paddingRight: 8,
  },
  rightItem: {
    paddingLeft: 8,
  },
  emptyWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
  },
});

export default Products;