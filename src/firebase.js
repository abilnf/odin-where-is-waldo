import { initializeApp } from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/storage";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectStorageEmulator, getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAeipwV6TlrIN3buzwxH0yW4epX-XgXIpE",
  authDomain: "abilnf-odin-where-is-waldo.firebaseapp.com",
  projectId: "abilnf-odin-where-is-waldo",
  storageBucket: "abilnf-odin-where-is-waldo.appspot.com",
  messagingSenderId: "102810098472",
  appId: "1:102810098472:web:0794e726ab02bf3aa1ce1d",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();
const storage = getStorage();

// connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
// connectFirestoreEmulator(db, "localhost", 8080);
// connectStorageEmulator(storage, "localhost", 9199);

export { app, auth, storage, db };
