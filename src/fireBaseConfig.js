// fireBaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA_2MX1zGPAcmH7gkEyeg3uuIBm4nXa-lg",
  authDomain: "lab-reports-f8033.firebaseapp.com",
  projectId: "lab-reports-f8033",
  storageBucket: "lab-reports-f8033.appspot.com",
  messagingSenderId: "883860381287",
  appId: "1:883860381287:web:7adec79c9714d47f74bec2",
  measurementId: "G-GP9G5HS4QE"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
