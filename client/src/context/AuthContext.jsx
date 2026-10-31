import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/Api";
import { AuthContext } from "./AuthContextDefinition";

const AuthProvider = ({ children }) => {
const currency = "INR";
const delivery_fee = 50;
const backendUrl = import.meta.env.VITE_BACKEND_URL || (import.meta.env.DEV ? "http://localhost:4000" : "");
const [products, setProducts] = useState([]);
const [search, setSearch] = useState("");
const [showSearch, setShowSearch] = useState(false);
const [cartItems, setCartItems] = useState({});
const [user, setUser] = useState(null);
const [isAuthenticated, setIsAuthenticated] = useState(false);
const [isLoading, setIsLoading] = useState(true);
const navigate = useNavigate();

const login = useCallback((userData) => {
  if (!userData) {
    setUser(null);
    setIsAuthenticated(false);
    return;
  }
  setUser({
    _id: userData._id || userData.id,
    name: userData.name,
    email: userData.email,
    role: userData.role || "user",
  });
  setIsAuthenticated(true);
}, []);

useEffect(() => {
  let active = true;
  const restoreSession = async () => {
    try {
      const response = await api.get("/api/user/session", { skipAuthRedirect: true });
      if (active && response.data.success && response.data.user) {
        login(response.data.user);
      }
    } catch (error) {
      if (error.response?.status !== 401 && error.message !== "Network Error") {
        console.error("Session restore failed:", error);
      }
      if (active) {
        setUser(null);
        setIsAuthenticated(false);
      }
    } finally {
      if (active) setIsLoading(false);
    }
  };
  restoreSession();
  return () => {
    active = false;
  };
}, [login]);

const logout = async () => {
  const role = user?.role;
  try {
    await api.post(role === "admin" ? "/api/admin/logout" : "/api/user/logout");
  } catch (error) {
    console.error("Logout failed:", error);
  } finally {
    setUser(null);
    setIsAuthenticated(false);
    setCartItems({});
  }
};

const getUserCart = useCallback(async () => {
  try {
    const response = await api.post("/api/cart/getUserCart", {});
    if (response.data.success) {
      const transformedCart = {};
      (response.data.cart || []).forEach((item) => {
        const productId = String(item.productId?._id || item.productId);
        if (!transformedCart[productId]) transformedCart[productId] = {};
        transformedCart[productId][item.size || ""] = item.quantity;
      });
      setCartItems(transformedCart);
    }
  } catch (error) {
    if (error.response?.status !== 401 && error.message !== "Network Error") {
      toast.error(error.response?.data?.message || "Failed to load cart");
    }
  }
}, []);

const addToCart = async (itemId, size) => {
  const product = products.find((item) => String(item._id) === String(itemId));
  const chosenSize = size || product?.sizes?.find((item) => String(item).toUpperCase() === "M") || product?.sizes?.[0] || "";
  const productId = String(itemId);
  setCartItems((prev) => ({
    ...prev,
    [productId]: { ...(prev[productId] || {}), [chosenSize]: (prev[productId]?.[chosenSize] || 0) + 1 },
  }));
  if (!isAuthenticated) return;
  try {
    const response = await api.post("/api/cart/add", { productId, quantity: 1, size: chosenSize });
    if (!response.data.success) await getUserCart();
  } catch (error) {
    toast.error(error.response?.data?.message || "Add to cart failed");
    await getUserCart();
  }
};

const updateQuantity = async (itemId, size, quantity) => {
  const productId = String(itemId);
  setCartItems((prev) => ({ ...prev, [productId]: { ...(prev[productId] || {}), [size]: quantity } }));
  if (isAuthenticated) await api.post("/api/cart/update", { productId, size, quantity });
};

const clearCart = useCallback(async () => {
  setCartItems({});
  if (isAuthenticated) await api.post("/api/cart/clear", {});
}, [isAuthenticated]);

const getProductData = useCallback(async () => {
  try {
    const response = await api.get("/api/product/list", { params: { activeOnly: true } });
    if (response.data.success) setProducts(response.data.products);
  } catch (error) {
    console.debug("Product list fetch error (non-critical):", error.message);
  }
}, []);

const getCartCount = useCallback(() => Object.values(cartItems)
  .flatMap((sizes) => Object.values(sizes))
  .reduce((total, quantity) => total + (quantity > 0 ? quantity : 0), 0), [cartItems]);
const getCartAmount = () => Object.entries(cartItems).reduce((total, [id, sizes]) => {
const product = products.find((item) => String(item._id) === id);
  return total + (product ? Object.entries(sizes).reduce((sum, [, quantity]) => sum + product.price * quantity, 0) : 0);
}, 0);

useEffect(() => { getProductData(); }, [getProductData]);
useEffect(() => {
  if (isAuthenticated && user?.role === "user") getUserCart();
}, [isAuthenticated, user, getUserCart]);

return (
  <AuthContext.Provider value={{
    login, logout, user, token: isAuthenticated, setToken: setIsAuthenticated,
    isLoading, products, currency, delivery_fee, search, setSearch, showSearch, setShowSearch,
    cartItems, setCartItems, addToCart, getCartCount, clearCart, updateQuantity, getCartAmount,
    navigate, backendUrl,
  }}>
    {children}
  </AuthContext.Provider>
);
};

export default AuthProvider;