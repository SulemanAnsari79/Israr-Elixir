import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Menu } from "lucide-react";
import {
  getOrders,
  getRecentNotices,
  getUsers,
} from "../services/AdminService.js";

const SEEN_BADGES_STORAGE_KEY = "admin_sidebar_seen_badges";

const getInitialSeenCounts = () => {
  try {
    const raw = localStorage.getItem(SEEN_BADGES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const AdminSidebar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const [badgeCounts, setBadgeCounts] = useState({
    users: 0,
    leaveRequests: 0,
    orders: 0,
    orderRequests: 0,
    refunds: 0,
    notices: 0,
  });
  const [seenCounts, setSeenCounts] = useState(getInitialSeenCounts);
  const menuGroups = [
    {
      name: "Overview",
      items: [{ name: "Dashboard", path: "/admin" }],
    },
    {
      name: "Store",
      items: [
        { name: "Products", path: "/admin/products" },
        { name: "Homepage", path: "/admin/homepage" },
        { name: "Store Policies", path: "/admin/policies" },
      ],
    },
    {
      name: "Orders",
      items: [
        { name: "Orders", path: "/admin/orders", badgeKey: "orders" },
        { name: "Order Requests", path: "/admin/order-requests", badgeKey: "orderRequests" },
        { name: "Refund Control", path: "/admin/refunds", badgeKey: "refunds" },
      ],
    },
    {
      name: "Customers",
      items: [{ name: "Users", path: "/admin/users", badgeKey: "users" }],
    },
    {
      name: "Communication",
      items: [{ name: "Notices", path: "/admin/notices", badgeKey: "notices" }],
    },
  ];
  const getActiveGroupNames = () => menuGroups
    .filter((group) => group.items.some((item) => location.pathname === item.path))
    .map((group) => group.name);
  const [openGroups, setOpenGroups] = useState(getActiveGroupNames);

  const persistSeenCounts = (nextSeenCounts) => {
    try {
      localStorage.setItem(SEEN_BADGES_STORAGE_KEY, JSON.stringify(nextSeenCounts));
    } catch {
      // Ignore storage write failures.
    }
  };

  const markBadgeAsSeen = (badgeKey) => {
    if (!badgeKey) return;

    setSeenCounts((prev) => {
      const next = {
        ...prev,
        [badgeKey]: badgeCounts?.[badgeKey] || 0,
      };
      persistSeenCounts(next);
      return next;
    });
  };

  const getVisibleBadgeCount = (badgeKey) => {
    if (!badgeKey) return 0;
    const total = Number(badgeCounts?.[badgeKey] || 0);
    const seen = Number(seenCounts?.[badgeKey] || 0);
    return Math.max(0, total - seen);
  };

  const extractArray = (payload, preferredKeys = []) => {
    if (Array.isArray(payload)) return payload;
    for (const key of preferredKeys) {
      if (Array.isArray(payload?.[key])) return payload[key];
    }
    if (payload && typeof payload === "object") {
      const firstArrayKey = Object.keys(payload).find((key) => Array.isArray(payload[key]));
      return firstArrayKey ? payload[firstArrayKey] : [];
    }
    return [];
  };

  const fetchBadgeCounts = async () => {
    try {
      const [usersRes, doctorsRes, appointmentsRes, leaveReqRes, ordersRes, noticesRes] = await Promise.all([
        getUsers(),
        getOrders(),
        getRecentNotices(),
      ]);

      const users = extractArray(usersRes?.data, ["users"]);
      const doctors = extractArray(doctorsRes?.data, ["doctors"]);
      const appointments = extractArray(appointmentsRes?.data, ["appointments"]);
      const leaveRequests = extractArray(leaveReqRes?.data, ["requests"]);
      const orders = extractArray(ordersRes?.data, ["orders"]);
      const notices = extractArray(noticesRes?.data, ["notices"]);

      const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
      const usersNewCount = users.filter((item) => {
        const ts = new Date(item?.createdAt || 0).getTime();
        return ts && ts >= threeDaysAgo;
      }).length;

      const doctorVerificationCount = doctors.filter((item) => item?.verified === false).length;

      const appointmentStatuses = new Set(["pending", "scheduled", "booked"]);
      const appointmentsPendingCount = appointments.filter((item) =>
        appointmentStatuses.has(String(item?.status || "").toLowerCase())
      ).length;

      const leaveRequestsPendingCount = leaveRequests.filter(
        (item) => String(item?.status || "").toLowerCase() === "pending"
      ).length;

      const activeOrderStatuses = new Set(["pending", "processing", "out for delivery"]);
      const ordersActiveCount = orders.filter((item) =>
        activeOrderStatuses.has(String(item?.status || "").toLowerCase())
      ).length;

      const orderRequestsCount = orders.reduce((acc, order) => {
        const isReturnRequested = String(order?.returnRequest?.status || "") === "Requested";
        const isReplaceRequested = String(order?.replaceRequest?.status || "") === "Requested";
        const isCancelRequested = String(order?.cancelRequest?.status || "") === "Requested";
        return acc + (isReturnRequested ? 1 : 0) + (isReplaceRequested ? 1 : 0) + (isCancelRequested ? 1 : 0);
      }, 0);

      const appointmentRefundCount = appointments.filter(
        (item) =>
          String(item?.status || "") === "Cancelled" &&
          String(item?.refundControl?.status || "") === "PendingApproval"
      ).length;

      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      const recentNoticesCount = notices.filter((item) => {
        const ts = new Date(item?.createdAt || 0).getTime();
        return ts && ts >= oneDayAgo;
      }).length;

      setBadgeCounts({
        users: usersNewCount,
        doctors: doctorVerificationCount,
        appointments: appointmentsPendingCount,
        leaveRequests: leaveRequestsPendingCount,
        orders: ordersActiveCount,
        orderRequests: orderRequestsCount,
        refunds: appointmentRefundCount,
        notices: recentNoticesCount,
      });
    } catch {
      // Keep navigation usable if badge APIs fail.
    }
  };

  useEffect(() => {
     
    const intervalId = setInterval(fetchBadgeCounts, 60000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed left-3 top-3 z-60 rounded-lg border border-[#e9e1d7] bg-[#fffdfa] p-2 text-[#302a23] shadow md:hidden"
      >
        <Menu size={20} />
      </button>

      {/* Overlay (Mobile) */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:sticky top-0 left-0 h-screen w-auto bg-[#fffdfa] border-r border-[#e9e1d7] z-50 transform transition-transform duration-300 overflow-y-auto
        ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Header */}
        <div className="border-b border-[#e9e1d7] p-3 text-center">
          <p className="font-serif text-lg tracking-[.12em] text-[#302a23]"> Israr Elixir</p>
          <p className="mt-1 text-[9px] font-semibold uppercase tracking-[.18em] text-[#8b7862]">Store management</p>
        </div>

        {/* Links */}
        <nav className="space-y-1 p-3 pt-5">
          {menuGroups.map((group) => {
            const hasActiveItem = group.items.some((item) => location.pathname === item.path);
            const isOpen = openGroups.includes(group.name) || hasActiveItem;
            return (
              <div key={group.name} className="mb-2">
                <button
                  type="button"
                  onClick={() => setOpenGroups((current) => (
                    current.includes(group.name)
                      ? current.filter((name) => name !== group.name)
                      : [...current, group.name]
                  ))}
                  className={`flex w-full items-center justify-between rounded-lg px-4 py-2 text-[10px] font-bold uppercase tracking-[.16em] transition ${
                    hasActiveItem ? "text-[#302a23]" : "text-[#8b7862] hover:bg-[#f1e9df]"
                  }`}
                  aria-expanded={isOpen}
                >
                  <span>{group.name}</span>
                  <ChevronDown size={15} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="mt-1 space-y-1">
                    {group.items.map((item) => {
                      const visibleBadge = getVisibleBadgeCount(item.badgeKey);
                      const isActive = location.pathname === item.path;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => {
                            setOpen(false);
                            markBadgeAsSeen(item.badgeKey);
                          }}
                          className={`ml-2 flex items-center justify-between rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                            isActive
                              ? "bg-[#302a23] text-white"
                              : "text-gray-700 hover:bg-[#f1e9df]"
                          }`}
                        >
                          <span>{item.name}</span>
                          {visibleBadge > 0 ? (
                            <span className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${
                              isActive ? "bg-white text-[#302a23]" : "bg-[#9e6b51] text-white"
                            }`}>
                              {visibleBadge > 99 ? "99+" : visibleBadge}
                            </span>
                          ) : null}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default AdminSidebar;
