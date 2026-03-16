import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; 
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC7XtXQAETkvU-zt2VjQG8AURKyu-fxlpc",
  authDomain: "ptp-momentum.firebaseapp.com",
  projectId: "ptp-momentum",
  storageBucket: "ptp-momentum.firebasestorage.app",
  messagingSenderId: "237481798359",
  appId: "1:237481798359:web:db299a286b59f6d2d79e92"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider(); // <--- THIS LINE IS THE FIX

export default app;