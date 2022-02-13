import "./App.css";

import Navbar from "./components/Navbar";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import Levels from "./pages/Levels";
import Play from "./pages/Play";
import { useState } from "react";
import Leaderboard from "./pages/Leaderboard";

function App() {
  const [level, setLevel] = useState(null);

  const navigate = useNavigate();

  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/">
          <Route
            index
            element={
              <Levels
                selectLevel={(selected) => {
                  setLevel(selected);
                  navigate(`/play/${selected}`);
                }}
              />
            }
          />
          <Route path="play/:levelId" element={<Play />} />
          <Route path="leaderboard" element={<Leaderboard />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
