import "./app.scss";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import React from "react";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import Home from "./pages/home/Home";
import Gigs from "./pages/gigs/Gigs";
import Gig from "./pages/gig/Gig";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import Add from "./pages/add/Add";
import Orders from "./pages/orders/Orders";
import Messages from "./pages/messages/Messages";
import Message from "./pages/message/Message";
import MyGigs from "./pages/myGigs/MyGigs";
import EmailVerification from "./pages/emailVerification/EmailVerification.jsx";
import ForgotPassword from "./pages/forgotPassword/ForgotPassword";
import ResetPassword from "./pages/resetPassword/ResetPassword";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import Pay from "./pages/pay/Pay";
import Success from "./pages/success/Success";
import Cancel from "./pages/pay/Cancel.jsx";
import MyProfile from "./pages/profile/Profile.jsx";

function App() {
  const queryClient = new QueryClient();

  const Layout = () => {
    return (
      <div className="app">
        <QueryClientProvider client={queryClient}>
          <Navbar />
          <Outlet />
          <Footer />
        </QueryClientProvider>
      </div>
    );
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        { // DONE
          path: "/",
          element: <Home />,
        },

        {
          // DONE
          path: "/verify-email",
          element: <EmailVerification />,
        },

        {
          // DONE
          path: "/forgot-password",
          element: <ForgotPassword />,
        },

        { // DONE
          path: "/profile/my",
          element: <MyProfile />,
        },
        {
          // DONE
          path: "/reset-password",
          element: <ResetPassword />,
        },

        {
          path: "/gigs",
          element: <Gigs />,
        },
        { // DONE
          path: "/myGigs",
          element: <MyGigs />,
        },
        { // DONE
          path: "/orders",
          element: <Orders />,
        },
        {
          path: "/messages",
          element: <Messages />,
        },
        {
          path: "/message/:id",
          element: <Message />,
        },
        { // DONE
          path: "/add",
          element: <Add />,
        },
        { // DONE
          path: "/gig/:id",
          element: <Gig />,
        },
        {
          // DONE
          path: "/register",
          element: <Register />,
        },
        {
          // DONE
          path: "/login",
          element: <Login />,
        },
        { // DONE
          path: "/pay/:id",
          element: <Pay />,
        },
        { // DONE
          path: "/pay/success",
          element: <Success />,
        },
        { // DONE
          path: "/pay/:id/cancel",
          element: <Cancel />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
