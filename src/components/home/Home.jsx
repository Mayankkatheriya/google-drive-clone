import React from "react";
import Sidebar from "./Sidebar";
import Data from "./Data";
import Split from "react-split";

const Home = () => {
  return (
      <Split minSize={200} sizes={[15, 85]} direction="horizontal" className="split"
      >
        <Sidebar />
        <Data />
      </Split>
  );
};

export default Home;
