import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {
  clearIndexedDbPersistence,
  initializeFirestore,
  memoryLocalCache,
  persistentLocalCache,
  persistentMultipleTabManager,
  terminate,
} from "firebase/firestore";
import firebaseConfig from "./firebaseConfig";

const app = initializeApp(firebaseConfig);
// IndexedDB cache: file lists render instantly on revisit, then sync live.
const db = initializeFirestore(app, {
  localCache:
    typeof window === "undefined"
      ? memoryLocalCache()
      : persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

/** Wipes cached file metadata (shared devices). Firestore is unusable afterwards — reload the page. */
async function clearFirestoreCache() {
  await terminate(db);
  await clearIndexedDbPersistence(db);
}

export { auth, provider, db, app, clearFirestoreCache };
