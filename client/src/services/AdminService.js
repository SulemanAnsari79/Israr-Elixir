import axios from "axios";

const RAW_BASE_URL = import.meta.env.VITE_BACKEND_URL || (import.meta.env.DEV ? "http://localhost:4000" : "");
const TRIMMED_BASE_URL = RAW_BASE_URL.replace(/\/+$/, "");
const API_BASE_URL = TRIMMED_BASE_URL.endsWith("/api") ? TRIMMED_BASE_URL : `${TRIMMED_BASE_URL}/api`;
const API = axios.create({ baseURL: API_BASE_URL, withCredentials: true });

export const getStats = () => API.get("/admin/stats");
export const getUsers = () => API.get("/user/users");
export const createUser = (data) => API.post("/user/create-user", data);
export const updateUser = (id, data) => API.put(`/user/update-user/${id}`, data);
export const deleteUser = (id) => API.delete(`/user/delete-user/${id}`);

export const getProducts = () => API.get("/product/list");
export const createProduct = (data) => API.post("/product/create-product", data);
export const updateProduct = (id, data) => API.put(`/product/update-product/${id}`, data);
export const deleteProduct = (id) => API.delete(`/admin/delete-product/${id}`);

export const getHomepageSettings = () => API.get("/homepage/admin");
export const saveHomepageSettings = (data) => API.put("/homepage", data);

export const getOrders = () => API.get("/admin/orders");
export const getOrderInvoice = (id, download = false) => API.get(`/admin/order/${id}/invoice`, {params: download ? { download: true } : {},responseType: "blob",});
export const updateOrderStatus = (id, data) => API.put(`/order/orders/${id}`, data);

export const sendNoticeEmails = (data) => API.post("/admin/notices/send", data);
export const getRecentNotices = () => API.get("/admin/notices/recent");

export const getPolicies = () => API.get("/policies");
export const savePolicies = (data) => API.put("/policies", data);

export default API;
