// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCp_sUzcmpNDBP-sz6jkU6gqGy98V3TcZQ",
  authDomain: "tictactoe-online-c4a07.firebaseapp.com",
  projectId: "tictactoe-online-c4a07",
  storageBucket: "tictactoe-online-c4a07.appspot.com",
  messagingSenderId: "827651525557",
  appId: "1:827651525557:web:cf3e3ed3983e480673a7fc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)