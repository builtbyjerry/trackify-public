import { useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getTransactionItems, getTransactions } from '../api/transactions.js';
import { getDebtPayment } from '../api/debtPayment.js';
import { errorLog, log, warn } from '../utils/loggers.js';

// Cache keys — just unique identifiers
const TX_CACHE_KEY = 'transactions_cache_v1';
const TX_ITEMS_CACHE_KEY = 'transaction_items_cache_v1';

// Cache duration (in ms)
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

export function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [transactionItems, setTransactionItems] = useState([])
  const [debtPayments, setDebtPayments] = useState([])
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const loadFromCache = useCallback(async () => {
    try {
      const cachedTx = await AsyncStorage.getItem(TX_CACHE_KEY);
      const cachedItems = await AsyncStorage.getItem(TX_ITEMS_CACHE_KEY);

      if (cachedTx && cachedItems) {
        log("Attempting to load from cache")
        const txParsed = JSON.parse(cachedTx);
        const itemsParsed = JSON.parse(cachedItems);

        setTransactions(txParsed.data || []);
        setTransactionItems(itemsParsed.data || []);
      }
    } catch (err) {
      warn('Error loading cached transactions:', err);
    }
  }, []);

  const fetchTransactions = useCallback(async (force = false) => {
    try {
      setLoading(true);
      setError(null);
      log("Attempting to fetch from db")

      // Check cache validity
      const cachedTx = await AsyncStorage.getItem(TX_CACHE_KEY);
      const cachedItems = await AsyncStorage.getItem(TX_ITEMS_CACHE_KEY);
      let useCache = false;

      if (!force && cachedTx && cachedItems) {
        const { timestamp: txTime } = JSON.parse(cachedTx);
        const { timestamp: itemTime } = JSON.parse(cachedItems);
        const now = Date.now();

        // If cache is fresh (< 2 min old)
        if (now - txTime < CACHE_TTL ) {
          useCache = true;
        }
      }

      if (useCache) {
        log('🟢 Using fresh cached data')
        return
      }

      log(force ? '🔄 Forced refetch by user' : '🆕 Data fetched and cache updated');

      const txData = await getTransactions()

      const itemData = await getTransactionItems()

      fetchDebtPayments()

      setTransactions(txData);
      setTransactionItems(itemData);

      const cachePayload = (data) => JSON.stringify({ data, timestamp: Date.now() });
      await AsyncStorage.setItem(TX_CACHE_KEY, cachePayload(txData));
      await AsyncStorage.setItem(TX_ITEMS_CACHE_KEY, cachePayload(itemData));

      log('🆕 Data fetched and cache updated');
    } catch (err) {
      errorLog('Error fetching transactions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);
  const refreshTransactions = () => fetchTransactions(true)
  const fetchDebtPayments = async () => {
    const data = await getDebtPayment()
    setDebtPayments(data)
  }

  // Load cache instantly, then fetch new data silently
  useEffect(() => {
    loadFromCache();
    fetchTransactions()
    fetchDebtPayments()
  }, [loadFromCache, fetchTransactions]);

  return {
    transactions,
    transactionItems,
    debtPayments,
    loading,
    error,
    fetchTransactions,
    refreshTransactions 
  };
}
