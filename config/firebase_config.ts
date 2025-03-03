import firebase, { deleteApp, getApp, initializeApp } from "@react-native-firebase/app";
import {  getMessaging } from "@react-native-firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDlFb3sxdFZSTVVjnnzFVOvsXeekA37Ckw",
  authDomain: "godesk-6367f.firebaseapp.com",
  projectId: "godesk-6367f",
  storageBucket: "godesk-6367f.firebasestorage.app",
  messagingSenderId: "1024848291283",
  appId: "1:1024848291283:web:ab1c700f1604dbe9493b26",
  measurementId: "G-LBJ0CCVVP2",
  databaseURL: "",
};

export async function initializeFirebase() {
  try {
    return getApp();
  } catch (e) {
    console.error(e);
    return initializeApp(firebaseConfig);
  }
}

export async function getFirebaseMessaging() {
  console.log("initialize messaging app");
  const app = await initializeFirebase(); // Ensure Firebase is initialized
  console.log("app -> ", app);
  
  const messaging = getMessaging(app);
  return messaging;
}
