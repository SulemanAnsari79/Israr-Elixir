import { getAuthCookie } from "./AuthCookies";
import axios from "axios";

const RAW_BASE_URL =
  import.meta.env.VITE_BACKEND_URL ||
  (import.meta.env.DEV ? "http://localhost:4000" : "");
const TRIMMED_BASE_URL = RAW_BASE_URL.replace(/\/+$/, "");
const API_BASE_URL = TRIMMED_BASE_URL.endsWith("/api")
	? TRIMMED_BASE_URL
	: `${TRIMMED_BASE_URL}/api`;

const API = axios.create({ baseURL: API_BASE_URL }); 

// Statistics
export const getStats = () => API.get("/admin/stats",{headers: {Authorization: `Bearer ${getAuthCookie("token")}`}});

// Users
export const getUsers = () => API.get("/user/users", {headers: {Authorization: `Bearer ${getAuthCookie("token")}`}} );
export const createUser = (data) => API.post("/user/create-user", data, {headers: {Authorization: `Bearer ${getAuthCookie("token")}`}} );
export const updateUser = (id, data) => API.put(`/user/update-user/${id}`, data, {headers: {Authorization: `Bearer ${getAuthCookie("token")}`}} );
export const deleteUser = (id) => API.delete(`/user/delete-user/${id}`, {headers: {Authorization: `Bearer ${getAuthCookie("token")}`}} );

// Products
export const getProducts = () => API.get("/product/list", { withCredentials: true });
export const createProduct = (data) => API.post('/product/create-product', data, {headers: {Authorization: `Bearer ${getAuthCookie("token")}`}});
export const updateProduct = (id, data) => API.put(`/product/update-product/${id}`, data, {headers: {Authorization: `Bearer ${getAuthCookie("token")}`}});
export const deleteProduct = (id) => API.delete(`/admin/delete-product/${id}`, {headers: {Authorization: `Bearer ${getAuthCookie("token")}`}});

// Homepage content
export const getHomepageSettings = () => API.get('/homepage/admin', { headers: { Authorization: `Bearer ${getAuthCookie("token")}` } });
export const saveHomepageSettings = (data) => API.put('/homepage', data, { headers: { Authorization: `Bearer ${getAuthCookie("token")}` } });

// Orders
export const getOrders = () => API.get("/admin/orders", {headers: {Authorization: `Bearer ${getAuthCookie("token")}`}});
export const updateOrderStatus = (id, data) => API.put(`/order/orders/${id}`, data, {headers: {Authorization: `Bearer ${getAuthCookie("token")}`}});


// Delivery Status Api
export const getDeliveryLocationRules = () =>API.get("/admin/delivery-location-rules", {headers: { Authorization: `Bearer ${getAuthCookie("token")}` },});
export const updateDeliveryLocationRules = (data) => API.put("/admin/delivery-location-rules", data, {headers: { Authorization: `Bearer ${getAuthCookie("token")}` },});

// Notices
export const sendNoticeEmails = (data) => API.post("/admin/notices/send", data, {headers: { Authorization: `Bearer ${getAuthCookie("token")}` },});
export const getRecentNotices = () => API.get("/admin/notices/recent", {headers: { Authorization: `Bearer ${getAuthCookie("token")}` },});

export default API;
