import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOrders, getStats, getUsers } from "../../services/AdminService.js";
import StatCard from "../../components/StatCard";
import { FiUsers, FiDollarSign, FiShoppingCart, FiLoader, FiPackage } from "react-icons/fi";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    todayOrders: 0,
    todayRevenue: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statsResult, usersResult, ordersResult] = await Promise.allSettled([
          getStats(),
          getUsers(),
          getOrders(),
        ]);

        if (statsResult.status === "fulfilled" && statsResult.value?.data) {
          setStats(statsResult.value.data);
        }

        if (usersResult.status === "fulfilled" && Array.isArray(usersResult.value?.data)) {
          const latestUsers = [...usersResult.value.data]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);
          setRecentUsers(latestUsers);
        }

        if (
          ordersResult.status === "fulfilled" &&
          Array.isArray(ordersResult.value?.data?.orders)
        ) {
          const orders = ordersResult.value.data.orders;
          const pendingCount = orders.filter(
            (order) => order.status?.toLowerCase() === "pending"
          ).length;
          setPendingOrders(pendingCount);
          setRecentOrders(orders.slice(0, 5));
        }

        const failedRequests = [statsResult, usersResult, ordersResult].filter(
          (result) => result.status === "rejected"
        );
        if (failedRequests.length > 0) {
          setError("Some dashboard data could not be loaded. Please refresh.");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard data");
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <FiLoader className="text-4xl text-blue-500 animate-spin" />
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's your business overview.</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Today's Orders"
          value={stats.todayOrders || 0}
          icon={<FiPackage />}
          bgColor="bg-amber-50"
          iconColor="text-amber-600"
        />
        <StatCard
          title="Today's Revenue"
          value={`₹${(stats.todayRevenue || 0).toLocaleString()}`}
          icon={<FiDollarSign />}
          bgColor="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers || 0}
          icon={<FiUsers />}
          bgColor="bg-blue-50"
          iconColor="text-blue-600"
          trend="+12.5%"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders || 0}
          icon={<FiShoppingCart />}
          bgColor="bg-purple-50"
          iconColor="text-purple-600"
          trend="+15.3%"
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts || 0}
          icon={<FiShoppingCart />}
          bgColor="bg-purple-50"
          iconColor="text-purple-600"
          trend="+15.3%"
        />
         
        <StatCard
          title="Total Revenue"
          value={`₹${(stats.totalRevenue || 0).toLocaleString()}`}
          icon={<FiDollarSign />}
          bgColor="bg-indigo-50"
          iconColor="text-indigo-600"
          trend="+22.1%"
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
              <p className="text-sm text-gray-500 mt-1">Latest customer orders</p>
            </div>
            <button
              onClick={() => navigate("/admin/orders")}
              className="text-sm font-semibold text-gray-700 hover:text-black"
            >
              View all
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order._id} className="p-5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {order.shippingDetails?.fullName || order.user?.name || "Unknown customer"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      #{order._id?.slice(-8).toUpperCase()} ·{" "}
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("en-GB")
                        : "-"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Time:{" "}
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-gray-900">
                      ₹{(order.totalAmount || 0).toLocaleString()}
                    </p>
                    <span className="text-xs text-gray-500">{order.status || "Pending"}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="px-6 py-8 text-center text-gray-500">No recent orders</p>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recent Users</h2>
              <p className="text-sm text-gray-500 mt-1">Latest registered users</p>
            </div>
            <button
              onClick={() => navigate("/admin/users")}
              className="text-sm font-semibold text-gray-700 hover:text-black"
            >
              View all
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {recentUsers.length > 0 ? (
              recentUsers.map((user) => (
                <div key={user._id} className="p-5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 mt-1 truncate">{user.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("en-GB")
                        : "-"}{" "}
                      ·{" "}
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      user.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              ))
            ) : (
              <p className="px-6 py-8 text-center text-gray-500">No recent users</p>
            )}
          </div>
        </div>

        

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate("/admin/users")}
              className="flex-1 min-w-[140px] px-3 py-2 text-sm border rounded-lg font-medium hover:shadow-lg hover:bg-black hover:text-white transition"
            >
              Manage Users
            </button>
             
            <button
              onClick={() => navigate("/admin/orders")}
              className="flex-1 min-w-[140px] px-3 py-2 text-sm border rounded-lg font-medium hover:shadow-lg hover:bg-black hover:text-white transition"
            >
              Manage Orders
            </button>
            
            <button
              onClick={() => navigate("/admin/products")}
              className="flex-1 min-w-[140px] px-3 py-2 text-sm border rounded-lg font-medium hover:shadow-lg hover:bg-black hover:text-white transition"
            >
              Manage Products
            </button>
            <button
              onClick={() => navigate("/admin/order-requests")}
              className="flex-1 min-w-[140px] px-3 py-2 text-sm border rounded-lg font-medium hover:shadow-lg hover:bg-black hover:text-white transition"
            >
              Manage Order Requests
            </button>
            
            <button
              onClick={() => navigate("/admin/notices")}
              className="flex-1 min-w-[140px] px-3 py-2 text-sm border rounded-lg font-medium hover:shadow-lg hover:bg-black hover:text-white transition"
            >
              Send Notices
            </button>
          </div>

          {/* Stats Summary */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Active Users:</span>
                <span className="font-medium text-gray-900">{stats.totalUsers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Inactive Users:</span>
                <span className="font-medium text-gray-900">{stats.totalInactiveUsers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Products:</span>
                <span className="font-medium text-gray-900">{stats.totalProducts}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Pending Orders:</span>
                <span className="font-medium text-gray-900">{pendingOrders}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
