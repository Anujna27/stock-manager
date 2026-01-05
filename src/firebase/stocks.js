// Firestore operations for stocks
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

/**
 * Add a stock to user's portfolio
 * @param {string} userId - User ID
 * @param {Object} stockData - Stock data (ticker, quantity, buyPrice)
 * @returns {Promise} Document reference
 */
export const addStock = async (userId, stockData) => {
  const stocksRef = collection(db, 'users', userId, 'stocks');
  return addDoc(stocksRef, {
    ...stockData,
    createdAt: serverTimestamp()
  });
};

/**
 * Get all stocks for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of stock documents
 */
export const getStocks = async (userId) => {
  const stocksRef = collection(db, 'users', userId, 'stocks');
  const q = query(stocksRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

/**
 * Delete a stock from user's portfolio
 * @param {string} userId - User ID
 * @param {string} stockId - Stock document ID
 * @returns {Promise} Delete promise
 */
export const deleteStock = async (userId, stockId) => {
  const stockRef = doc(db, 'users', userId, 'stocks', stockId);
  return deleteDoc(stockRef);
};

