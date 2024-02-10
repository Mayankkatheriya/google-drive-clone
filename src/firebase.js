//------ firebase.js---------->
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import firebaseConfig from "./firebaseConfig";

//------ Initialize Firebase---------->
const app = initializeApp(firebaseConfig);

//------ Set up Firebase services---------->
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const storage = getStorage(app);

export { auth, provider, storage, db, app };
