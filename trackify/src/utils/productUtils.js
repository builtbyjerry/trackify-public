// utils/productUtils.js
const INITIAL_COLORS = ['#E8F8EE', '#EEF1FF', '#FFF6E5', '#FFE9E9', '#E5F0FF']
const INITIAL_TEXT_COLORS = ['#0F6E56', '#635BFF', '#854F0B', '#A32D2D', '#1a5ca8']

export const getProductInitial = (name = '') => name?.charAt(0)?.toUpperCase() ?? ''

export const getProductColor = (name = '') => {
  const index = name.charCodeAt(0) % INITIAL_COLORS.length
  return {
    background: INITIAL_COLORS[index],
    text: INITIAL_TEXT_COLORS[index],
  }
}