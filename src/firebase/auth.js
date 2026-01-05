// Authentication service
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from './config';

/**
 * Sign up a new user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} Firebase user credential
 */
export const signUp = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

/**
 * Sign in an existing user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} Firebase user credential
 */
export const signIn = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

/**
 * Sign out the current user
 * @returns {Promise} Sign out promise
 */
export const logOut = () => {
  return signOut(auth);
};

/**
 * Subscribe to authentication state changes
 * @param {Function} callback - Callback function that receives the user object
 * @returns {Function} Unsubscribe function
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

