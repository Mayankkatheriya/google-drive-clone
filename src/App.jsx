import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./components/login/Login";
import ErrorPage from "./components/ErrorPage";
import { store } from "./store/Store";
import { Provider } from "react-redux";
import HomeLayout from "./components/HomeLayout";
import Recent from "./components/recent/Recent";
import Starred from "./components/starred/Starred";
import Trash from "./components/trash/Trash";
import SearchItems from "./components/search/SearchItems";
import Data from "./components/home/Data";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  //----- Create a router instance------------>
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      errorElement: <ErrorPage />,
      children: [
        {
          path: "/",
          element: <Login />,
        },
      ],
    },
    {
      path: "/",
      element: <HomeLayout />,
      errorElement: <ErrorPage />,
      children: [
        {
          path: "/home",
          element: <Data />,
        },
        {
          path: "/recent",
          element: <Recent />,
        },
        {
          path: "/starred",
          element: <Starred />,
        },
        {
          path: "/trash",
          element: <Trash />,
        },
        {
          path: "/search/:query",
          element: <SearchItems />,
        },
      ],
    },
  ]);

  return (
    //----- Provide the Redux store to the entire app------------>
    <Provider store={store}>
      {/* Use the custom router for navigation */}
      <RouterProvider router={router} />
      {/* Toast notification container for displaying messages */}
      <ToastContainer
        position="top-right"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </Provider>
  );
}

export default App;
