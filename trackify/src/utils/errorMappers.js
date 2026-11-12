// src/utils/errorMapper.js

const RLS_CODES = ['42501', 'PGRST301']
const NOT_FOUND_CODES = ['PGRST116']
const DUPLICATE_CODES = ['23505']
const INVALID_INPUT_CODES = ['22P02', '23502', 'PGRST204']
const NETWORK_CODES = ['NETWORK_ERROR', 'FetchError']

export const mapError = (error, context = '') => {
  const code = error?.code
  const message = error?.message ?? error?.error ?? ''

  // RLS / permission errors
  if (RLS_CODES.some(c => code === c) || message.includes('violates row-level security')) {
    return 'You don\'t have permission to do this. Contact your business owner.'
  }

  // Not found
  if (NOT_FOUND_CODES.some(c => code === c) || message.includes('0 rows')) {
    return 'Record not found. It may have been deleted.'
  }

  // Duplicate
  if (DUPLICATE_CODES.some(c => code === c)) {
    return 'This already exists. Please check and try again.'
  }

  // Schema/column mismatch — dev error, shouldn't reach prod
  if (INVALID_INPUT_CODES.some(c => code === c)) {
    return 'Something went wrong with the data. Please try again.'
  }

  // Network
  if (NETWORK_CODES.some(c => code === c) || message.includes('fetch')) {
    return 'No internet connection. Please check your network and try again.'
  }

  // Auth errors
  if (message.includes('User already registered')) {
    return 'An account with this email already exists. Try logging in.'
  }
  if (message.includes('Invalid login credentials')) {
    return 'Incorrect email or password.'
  }
  if (message.includes('Email not confirmed')) {
    return 'Please verify your email before logging in.'
  }

  // Context-specific overrides
  if (context === 'addProduct' && (RLS_CODES.some(c => code === c) || message.includes('policy'))) {
    return 'Only owners and admins can add products.'
  }
  if (context === 'editProduct' && (RLS_CODES.some(c => code === c) || message.includes('policy'))) {
    return 'Only owners and admins can edit products.'
  }

  // OTP errors
  if (message.includes('Invalid OTP')) {
    return 'The code you entered is incorrect. Please try again.'
  }

  if (message.includes('Wrong OTP purpose')) {
    return 'This code can\'t be used for this action. Please request a new code.'
  }

  if (message.includes('OTP has expired')) {
    return 'Your code has expired. Please request a new one.'
  }

  if (message.includes('Email and OTP are required')) {
    return 'Please enter your email and verification code.'
  }

  // fallback
  return 'Something went wrong. Please try again. Or contact support'
}