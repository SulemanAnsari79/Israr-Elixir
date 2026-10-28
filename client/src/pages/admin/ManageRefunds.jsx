import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../services/Api";

const statusStyles = {
  Initiated: "bg-yellow-100 text-yellow-800",
  Processed: "bg-green-100 text-green-800",
  Failed: "bg-red-100 text-red-800",
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
};

const formatAmount = (amount, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
  }).format(Number(amount || 0));

const ManageRefunds = () => {
  const [refunds, setRefunds] = useState([]);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRefunds = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get(`/api/order/refunds?status=${status}`);
      setRefunds(response?.data?.orders || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load refund data");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchRefunds();
  }, [fetchRefunds]);

  const filteredRefunds = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return refunds;
    return refunds.filter((order) =>
      [
        order?._id,
        order?.refund?.razorpayRefundId,
        order?.razorpayPaymentId,
        order?.shippingDetails?.fullName,
        order?.shippingDetails?.email,
      ].some((value) => String(value || "").toLowerCase().includes(term))
    );
  }, [refunds, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Refunds</h1>
        <p className="mt-1 text-gray-600">
          Track refunds initiated through Razorpay. The status is updated by Razorpay webhooks.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}

      <section className="rounded-xl bg-white p-4 shadow">
        <div className="mb-4 flex flex-wrap gap-3">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search order, refund, payment, or customer"
            className="min-w-[280px] flex-1 rounded border p-2"
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded border p-2"
          >
            <option value="all">All statuses</option>
            <option value="Initiated">Initiated</option>
            <option value="Processed">Processed</option>
            <option value="Failed">Failed</option>
          </select>
          <button
            type="button"
            onClick={fetchRefunds}
            className="rounded bg-gray-900 px-4 py-2 text-white"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="p-3 text-gray-500">Loading refunds...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Refund ID</th>
                  <th className="p-3">Initiated</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Source</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Completed / Error</th>
                </tr>
              </thead>
              <tbody>
                {filteredRefunds.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-3 text-gray-500">
                      No refunds found
                    </td>
                  </tr>
                ) : (
                  filteredRefunds.map((order) => {
                    const refund = order.refund || {};
                    return (
                      <tr key={order._id} className="border-t align-top">
                        <td className="p-3">
                          <div className="font-medium">{order._id}</div>
                          <div className="text-xs text-gray-500">{order.razorpayPaymentId || "No payment ID"}</div>
                        </td>
                        <td className="p-3">
                          <div>{order.shippingDetails?.fullName || order.user?.name || "N/A"}</div>
                          <div className="text-xs text-gray-500">{order.shippingDetails?.email || order.user?.email || ""}</div>
                        </td>
                        <td className="p-3">{refund.razorpayRefundId || "Pending from Razorpay"}</td>
                        <td className="p-3 whitespace-nowrap">{formatDate(refund.initiatedAt)}</td>
                        <td className="p-3 whitespace-nowrap">{formatAmount(refund.amount, refund.currency)}</td>
                        <td className="p-3">{refund.source || "—"}</td>
                        <td className="p-3">
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusStyles[refund.status] || "bg-gray-100 text-gray-700"}`}>
                            {refund.status || "Unknown"}
                          </span>
                        </td>
                        <td className="p-3">
                          {refund.status === "Failed"
                            ? refund.failureReason || "Refund failed"
                            : formatDate(refund.processedAt)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default ManageRefunds;
