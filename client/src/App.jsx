// import { lazy, Suspense } from "react";
// import { BrowserRouter, Routes, Route } from "react-router-dom";

// import Home from "./pages/user/Home.jsx";
// import Products from "./pages/user/Products.jsx";
// import Shop from "./pages/user/Shop.jsx";
// import About from "./pages/user/About.jsx";
// import Contact from "./pages/user/Contact.jsx";
// import Cart from "./pages/user/Cart.jsx";
// import Login from "./pages/Login";
// import SelectedProduct from "./pages/user/SelectedProduct.jsx";

// import PrivateRoute from "./routes/PrivateRoute";
// import Profile from "./pages/user/Profile.jsx";
// import Checkout from "./pages/user/Checkout.jsx";
// import PlaceOrder from "./pages/user/PlaceOrder.jsx";
// import Policy from "./pages/user/Policy.jsx";
 

// import AdminRoute from "./routes/AdminRoute";
// import AdminLayout from "./layouts/AdminLayout.jsx";
// import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
// import ManageUsers from "./pages/admin/ManageUser.jsx";
// import ManageOrders from "./pages/admin/ManageOrders.jsx";
// import ManageOrderRequests from "./pages/admin/ManageOrderRequests.jsx";
// import ManageProducts from "./pages/admin/ManageProduct.jsx";
// import ManageHomepage from "./pages/admin/ManageHomepage.jsx";
// import Notices from "./pages/admin/Notices.jsx";
// import ManageRefunds from "./pages/admin/ManageRefunds.jsx";
// import ManagePolicies from "./pages/admin/ManagePolicies.jsx";

// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import AuthProvider from "./context/AuthContext.jsx";
// import { GoogleOAuthProvider } from "@react-oauth/google";
 

// function App() {
//   const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

//   const routes = (
//     <AuthProvider>
//       <ToastContainer />
//       <Routes>
//         {/* PUBLIC */}
//         <Route path="/" element={<Home />} />
//         <Route path="/products" element={<Products />} />
//         <Route path="/shops" element={<Shop />} />
//         <Route path='/product/:productId' element={<SelectedProduct />} />
//         <Route path="/about" element={<About />} />
//         <Route path="/contact" element={<Contact />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/policies/:policyType" element={<Policy />} />

//         {/* USER */}
//         <Route element={<PrivateRoute />}>
//           <Route path="/cart" element={<Cart />} />
//           <Route path="/profile" element={<Profile />} />
//           <Route path="/checkout" element={<Checkout />} />
//           <Route path="/place-order" element={<PlaceOrder />} />
//         </Route>

//         {/* ADMIN */}
//         <Route element={<AdminRoute />}>
//           <Route path="/admin" element={<AdminLayout/>}>
//             <Route index element={<AdminDashboard />} />
//             <Route path="users" element={<ManageUsers />} />
//             <Route path="orders" element={<ManageOrders />} />
//             <Route path="order-requests" element={<ManageOrderRequests />} />
//             <Route path="refunds" element={<ManageRefunds />} />
//             <Route path="products" element={<ManageProducts />} />
//             <Route path="homepage" element={<ManageHomepage />} />
//             <Route path="notices" element={<Notices />} />
//             <Route path="policies" element={<ManagePolicies />} />
//           </Route>
//         </Route>
//       </Routes>
//     </AuthProvider>
//   );

//   return (
//     <BrowserRouter>
//       {googleClientId ? (
//         <GoogleOAuthProvider clientId={googleClientId}>{routes}</GoogleOAuthProvider>
//       ) : routes}
//     </BrowserRouter>
//   );
// }

// export default App;


import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import PrivateRoute from "./routes/PrivateRoute";
import AdminRoute from "./routes/AdminRoute";
import AuthProvider from "./context/AuthContext.jsx";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { GoogleOAuthProvider } from "@react-oauth/google";

// User pages
const Home = lazy(() => import("./pages/user/Home.jsx"));
const Products = lazy(() => import("./pages/user/Products.jsx"));
const Shop = lazy(() => import("./pages/user/Shop.jsx"));
const About = lazy(() => import("./pages/user/About.jsx"));
const Contact = lazy(() => import("./pages/user/Contact.jsx"));
const Cart = lazy(() => import("./pages/user/Cart.jsx"));
const SelectedProduct = lazy(() => import("./pages/user/SelectedProduct.jsx"));
const Profile = lazy(() => import("./pages/user/Profile.jsx"));
const Checkout = lazy(() => import("./pages/user/Checkout.jsx"));
const PlaceOrder = lazy(() => import("./pages/user/PlaceOrder.jsx"));
const Policy = lazy(() => import("./pages/user/Policy.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));

// Admin pages and layout
const AdminLayout = lazy(() => import("./layouts/AdminLayout.jsx"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard.jsx"));
const ManageUsers = lazy(() => import("./pages/admin/ManageUser.jsx"));
const ManageOrders = lazy(() => import("./pages/admin/ManageOrders.jsx"));
const ManageOrderRequests = lazy(() => import("./pages/admin/ManageOrderRequests.jsx"));
const ManageProducts = lazy(() => import("./pages/admin/ManageProduct.jsx"));
const ManageHomepage = lazy(() => import("./pages/admin/ManageHomepage.jsx"));
const Notices = lazy(() => import("./pages/admin/Notices.jsx"));
const ManageRefunds = lazy(() => import("./pages/admin/ManageRefunds.jsx"));
const ManagePolicies = lazy(() => import("./pages/admin/ManagePolicies.jsx"));

// Fallback shown while a page's JavaScript loads
function PageLoader() {
  return (
    <div
      className="flex min-h-[50vh] items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <p className="text-gray-600">Loading page...</p>
    </div>
  );
}

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const routes = (
    <AuthProvider>
      <ToastContainer />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* PUBLIC */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/shops" element={<Shop />} />
          <Route path="/product/:productId" element={<SelectedProduct />}/>
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/policies/:policyType" element={<Policy />} />

          {/* USER */}
          <Route element={<PrivateRoute />}>
            <Route path="/cart" element={<Cart />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/place-order" element={<PlaceOrder />} />
          </Route>

          {/* ADMIN */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<ManageUsers />} />
              <Route path="orders" element={<ManageOrders />} />
              <Route path="order-requests" element={<ManageOrderRequests />}/>
              <Route path="refunds" element={<ManageRefunds />} />
              <Route path="products" element={<ManageProducts />} />
              <Route path="homepage" element={<ManageHomepage />} />
              <Route path="notices" element={<Notices />} />
              <Route path="policies" element={<ManagePolicies />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </AuthProvider>
  );

  return (
    <BrowserRouter>
      {googleClientId ? (
        <GoogleOAuthProvider clientId={googleClientId}>
          {routes}
        </GoogleOAuthProvider>
      ) : (
        routes
      )}
    </BrowserRouter>
  );
}

export default App;
