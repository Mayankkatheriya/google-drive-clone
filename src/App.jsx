import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./components/login/Login";
import Home from "./components/home/Home";
import ErrorPage from "./components/ErrorPage";
import { store } from "./store/Store";
import { Provider } from "react-redux";
import HomeLayout from "./components/HomeLayout";
import Recent from "./components/recent/Recent";
import Starred  from "./components/starred/Starred";
import Trash from './components/trash/Trash';
import SearchItems from './components/search/SearchItems';

function App() {
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
          element: <Home />,
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
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
}

export default App;
