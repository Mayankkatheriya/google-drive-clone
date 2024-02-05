import React from "react";
import Header from "./components/header/Header";
import Sidebar from "./components/sidebar/Sidebar";
import Data from "./components/Data/Data";

function App() {
  return (
    <>
      <Header />
      <div className="App">
        <Sidebar />
        <Data />
      </div>
    </>
  );
}

export default App;
