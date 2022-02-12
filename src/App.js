import "./App.css";

import { initializeApp } from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDOSDuweiGasQcUuaO2N8bSdC02-QVUxtk",
  authDomain: "abilnf-odin-where-is-waldo.firebaseapp.com",
  projectId: "abilnf-odin-where-is-waldo",
  storageBucket: "abilnf-odin-where-is-waldo.appspot.com",
  messagingSenderId: "102810098472",
  appId: "1:102810098472:web:0794e726ab02bf3aa1ce1d",
};

const app = initializeApp(firebaseConfig);

function App() {
  return <div className="App"></div>;
}

export default App;
