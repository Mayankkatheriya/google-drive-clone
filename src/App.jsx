import React from "react";
import { createBrowserRouter, RouterProvider, } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./components/login/Login";
import Home from "./components/home/Home";
import { store } from "./store/Store";
import { Provider } from 'react-redux';

function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Layout />,
      children: [
        {
          path: '/',
          element: <Home />
        },
      ]
    },
    {
      path: 'login',
      element: <Login />
    }
  ])

  return (
    <Provider store = {store}>
      <RouterProvider router = {router} />
    </Provider>
  );
}

export default App;
