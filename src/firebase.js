// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDjxHSKsk9lYwEvEVHxV_S37g8DiiC7MaY",
  authDomain: "drive-clone-6f3ee.firebaseapp.com",
  projectId: "drive-clone-6f3ee",
  storageBucket: "drive-clone-6f3ee.appspot.com",
  messagingSenderId: "698212881083",
  appId: "1:698212881083:web:b469866b3bcc67b54a4f9e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const storage = getStorage(app);

export { auth, provider, storage, db, app, ref, uploadBytes, getDownloadURL };
