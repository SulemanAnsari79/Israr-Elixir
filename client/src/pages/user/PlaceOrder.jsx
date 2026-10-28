import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import OrderService from "../../services/OrderService.js";
import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer.jsx";
import { 
  PackageIcon, 
  Cancel01Icon, 
  ArrowReloadHorizontalIcon, 
  PackageReceiveIcon, 
  Calendar03Icon,
  Tick02Icon,
  InformationCircleIcon,
  ShoppingBasket01Icon
} from 'hugeicons-react';

const PlaceOrder = () => {
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  
  const [showCancelModal, setShowCancelModal] = useState(null);
  const [showReturnModal, setShowReturnModal] = useState(null);
  const [showReplaceModal, setShowReplaceModal] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [replaceReason, setReplaceReason] = useState('');

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const response = await OrderService.getUserOrders();
      if (response.success) setOrders(response.orders || []);
      else setError(response.message || "Failed to load orders");
    } catch {
      setError("Could not load your order history.");
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const getStatusConfig = (status) => {
    const configs = {
      'Delivered': { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', ring: 'focus:ring-emerald-100' },
      'Shipped': { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', ring: 'focus:ring-blue-100' },
      'Processing': { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', ring: 'focus:ring-amber-100' },
      'Pending': { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', ring: 'focus:ring-orange-100' },
      'Cancelled': { color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', ring: 'focus:ring-rose-100' },
    };
    return configs[status] || { color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100', ring: 'focus:ring-slate-100' };
  };

  const getRemainingDays = (order) => {
    const refDate = order.deliveredAt || order.updatedAt || order.createdAt;
    if (!refDate) return 0;
    const diff = (new Date(refDate).getTime() + 7 * 24 * 60 * 60 * 1000) - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const updateOrderInList = (updatedOrder) => {
    if (!updatedOrder?._id) return;
    setOrders((prev) => prev.map((item) => (item._id === updatedOrder._id ? updatedOrder : item)));
  };

  // Action Handlers
  const handleCancelOrder = async (id) => {
    try {
      setActionLoading((prev) => ({ ...prev, [id]: true }));
      setError(null);
      setSuccessMessage(null);

      const response = await OrderService.cancelOrder(id, cancelReason.trim());
      if (!response?.success) {
        throw new Error(response?.message || 'Failed to cancel order');
      }

      if (response.order) {
        updateOrderInList(response.order);
      } else {
        await fetchOrders();
      }

      setSuccessMessage(response.message || 'Cancellation request submitted');
      setShowCancelModal(null);
      setCancelReason('');
    } catch (err) {
      setError(err?.message || 'Failed to cancel order');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleReturnRequest = async (id) => {
    const reason = returnReason.trim();
    if (!reason) {
      setError('Return reason is required');
      return;
    }

    try {
      setActionLoading((prev) => ({ ...prev, [id]: true }));
      setError(null);
      setSuccessMessage(null);

      const response = await OrderService.requestReturn(id, reason);
      if (!response?.success) {
        throw new Error(response?.message || 'Failed to submit return request');
      }

      if (response.order) {
        updateOrderInList(response.order);
      } else {
        await fetchOrders();
      }

      setSuccessMessage(response.message || 'Return request submitted');
      setShowReturnModal(null);
      setReturnReason('');
    } catch (err) {
      setError(err?.message || 'Failed to submit return request');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleReplaceRequest = async (id) => {
    const reason = replaceReason.trim();
    if (!reason) {
      setError('Replacement reason is required');
      return;
    }

    try {
      setActionLoading((prev) => ({ ...prev, [id]: true }));
      setError(null);
      setSuccessMessage(null);

      const response = await OrderService.requestReplace(id, reason);
      if (!response?.success) {
        throw new Error(response?.message || 'Failed to submit replacement request');
      }

      if (response.order) {
        updateOrderInList(response.order);
      } else {
        await fetchOrders();
      }

      setSuccessMessage(response.message || 'Replacement request submitted');
      setShowReplaceModal(null);
      setReplaceReason('');
    } catch (err) {
      setError(err?.message || 'Failed to submit replacement request');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const selectedOrder = orders.find((order) => order._id === showDetailsModal) || null;
  const hasPendingCancelRequest = (order) => String(order?.cancelRequest?.status || '') === 'Requested';

  return (
    <div className="store-page min-h-screen font-['Plus_Jakarta_Sans']">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-12 md:py-20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Order <span className="text-[#1A56DB]">History</span></h1>
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Your fragrance orders and delivery updates</p>
            </div>
            <button onClick={fetchOrders} className="p-3 bg-white rounded-2xl border border-slate-100 text-slate-400 hover:text-[#1A56DB] transition-colors shadow-sm">
                <ArrowReloadHorizontalIcon size={20} />
            </button>
        </div>

        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-6 py-4 rounded-3xl mb-8 font-bold text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
            <Tick02Icon size={20} variant="bulk" /> {successMessage}
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-700 px-6 py-4 rounded-3xl mb-8 font-bold text-sm">
            {error}
          </div>
        )}

        {ordersLoading ? (
          <div className="text-center py-32 bg-white rounded-[3rem] border border-slate-50 shadow-sm">
             <div className="w-12 h-12 border-4 border-[#1A56DB] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
             <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Syncing Records...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[3rem] border border-slate-50 shadow-sm">
            <PackageIcon size={48} className="mx-auto text-slate-200 mb-6" variant="bulk" />
            <h3 className="text-2xl font-black text-slate-900 mb-2">No orders just yet</h3>
            <p className="text-slate-500 font-medium mb-8">Your order history will appear here.</p>
            <Link to="/products" className="inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#1A56DB] transition-all">
                Browse fragrances <ShoppingBasket01Icon size={18} />
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {orders.map((order) => {
              const status = getStatusConfig(order.status);
              return (
                <div key={order._id} className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-[0_6px_24px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all group">
                  <div className="flex items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-50">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className={`shrink-0 p-2 ${status.bg} ${status.color} rounded-xl`}>
                            <PackageIcon size={19} variant="bulk" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Order Ref</p>
                            <p className="text-xs font-black text-slate-900 truncate">#{order._id?.substring(0, 12).toUpperCase()}</p>
                        </div>
                    </div>
                    <div className={`shrink-0 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${status.bg} ${status.color}`}>
                        {order.status}
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <h3 className="text-base font-black text-slate-900 tracking-tight leading-snug line-clamp-2">
                            {order.items?.[0]?.name || 'Health Package'}
                            {order.items?.length > 1 && <span className="text-[#1A56DB]"> + {order.items.length - 1} more</span>}
                        </h3>
                        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-2">
                            <span className="text-lg font-black text-slate-900 font-mono">₹{order.totalAmount?.toFixed(2)}</span>
                            <span className={`text-[9px] font-black uppercase tracking-widest ${order.paymentStatus === 'Paid' ? 'text-emerald-500' : 'text-orange-500'}`}>
                              {order.paymentStatus}
                            </span>
                        </div>
                    </div>

                    <div className="shrink-0 flex justify-end">
                        {order.deliveredAt && (
                          <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100">
                             <Tick02Icon size={12} className="text-emerald-600" variant="bulk" />
                             <span className="text-[9px] font-black text-emerald-700 uppercase">{new Date(order.deliveredAt).toLocaleDateString("en-GB")}</span>
                          </div>
                        )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-4 mt-4 border-t border-slate-50">
                    {hasPendingCancelRequest(order) ? (
                      <div className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 text-amber-700 rounded-xl text-[9px] font-black uppercase tracking-widest border border-amber-100">
                        <InformationCircleIcon size={14} variant="bulk" /> Cancellation pending
                      </div>
                    ) : ['Pending', 'Processing'].includes(order.status) ? (
                      <button onClick={() => setShowCancelModal(order._id)} className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 text-rose-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all">
                        <Cancel01Icon size={14} /> Cancel
                      </button>
                    ) : null}
                    {order.status === 'Delivered' && getRemainingDays(order) > 0 && (
                      <>
                        <button onClick={() => setShowReturnModal(order._id)} className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 text-amber-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-600 hover:text-white transition-all">
                          <PackageReceiveIcon size={14} /> Return
                        </button>
                        <button onClick={() => setShowReplaceModal(order._id)} className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">
                          <ArrowReloadHorizontalIcon size={14} /> Replace
                        </button>
                      </>
                    )}
                    <button
                        onClick={() => setShowDetailsModal(order._id)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#1A56DB] transition-all ml-auto shadow-md shadow-slate-200"
                    >
                        <InformationCircleIcon size={14} variant="bulk" /> Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />

      {/* REUSABLE MODAL SYSTEM */}
      {[
        { id: showCancelModal, set: setShowCancelModal, title: 'Cancel Package', reason: cancelReason, setReason: setCancelReason, handler: handleCancelOrder, ring: 'focus:ring-rose-100' },
        { id: showReturnModal, set: setShowReturnModal, title: 'Return Request', reason: returnReason, setReason: setReturnReason, handler: handleReturnRequest, ring: 'focus:ring-amber-100' },
        { id: showReplaceModal, set: setShowReplaceModal, title: 'Replace Item', reason: replaceReason, setReason: setReplaceReason, handler: handleReplaceRequest, ring: 'focus:ring-blue-100' }
      ].map((modal, i) => modal.id && (
        <div key={i} className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-100 p-4">
            <div className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl border border-white animate-in zoom-in-95 duration-200">
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">{modal.title}</h2>
                <p className="text-slate-400 font-bold text-sm mb-8 leading-tight">State your clinical or quality reason below:</p>
                <textarea
                  value={modal.reason}
                  onChange={(e) => modal.setReason(e.target.value)}
                  placeholder="Example: Incorrect dosage, packaging damaged..."
                  className={`w-full bg-slate-50 border-none rounded-3xl p-6 text-sm font-bold text-slate-800 h-32 outline-none ring-2 ring-transparent transition-all mb-8 ${modal.ring}`}
                />
                <div className="flex gap-3">
                  <button onClick={() => { modal.set(null); modal.setReason(''); }} className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-colors">Back</button>
                  <button onClick={() => modal.handler(modal.id)} disabled={actionLoading[modal.id]} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest disabled:opacity-50 hover:bg-[#1A56DB] transition-all">
                    {actionLoading[modal.id] ? 'Syncing...' : 'Confirm'}
                  </button>
                </div>
            </div>
        </div>
      ))}

      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-100 p-4">
          <div className="bg-white rounded-[3rem] p-8 md:p-10 max-w-2xl w-full shadow-2xl border border-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Order Details</h2>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">
                  #{selectedOrder._id?.substring(0, 12).toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => setShowDetailsModal(null)}
                className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                <p className="mt-2 text-sm font-black text-slate-900">{selectedOrder.status}</p>
              </div>

            {selectedOrder?.cancelRequest?.status === 'Requested' && (
              <div className="mb-8 rounded-2xl border border-amber-100 bg-amber-50 p-4">
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Cancellation Request</p>
                <p className="mt-2 text-sm font-bold text-amber-900">Status: Pending Admin Approval</p>
                <p className="text-sm text-amber-800 mt-1">Reason: {selectedOrder?.cancelRequest?.reason || 'Not provided'}</p>
              </div>
            )}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment</p>
                <p className="mt-2 text-sm font-black text-slate-900">{selectedOrder.paymentStatus} ({selectedOrder.paymentMethod})</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Placed On</p>
                <p className="mt-2 text-sm font-black text-slate-900">{new Date(selectedOrder.createdAt).toLocaleString('en-GB')}</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Amount</p>
                <p className="mt-2 text-sm font-black text-slate-900">₹{selectedOrder.totalAmount?.toFixed(2)}</p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-black text-slate-900 mb-4">Items</h3>
              <div className="space-y-3">
                {(selectedOrder.items || []).map((item, index) => (
                  <div key={`${item.productId || item.name}-${index}`} className="bg-white border border-slate-100 rounded-2xl px-4 py-3 flex justify-between gap-4">
                    <div>
                      <p className="text-sm font-black text-slate-900">{item.name}</p>
                      <p className="text-xs font-bold text-slate-400 mt-1">Qty: {item.quantity}{item.size ? ` | Size: ${item.size}` : ''}</p>
                    </div>
                    <p className="text-sm font-black text-slate-900">₹{Number(item.price || 0).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-black text-slate-900 mb-4">Shipping Details</h3>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-1 text-sm">
                <p className="font-black text-slate-900">{selectedOrder.shippingDetails?.fullName}</p>
                <p className="font-bold text-slate-500">{selectedOrder.shippingDetails?.phone} | {selectedOrder.shippingDetails?.email}</p>
                <p className="font-bold text-slate-500">
                  {selectedOrder.shippingDetails?.address}, {selectedOrder.shippingDetails?.city}, {selectedOrder.shippingDetails?.state} - {selectedOrder.shippingDetails?.zip}, {selectedOrder.shippingDetails?.country}
                </p>
              </div>
            </div>

            {(selectedOrder.cancelReason || selectedOrder.returnRequest?.status === 'Requested' || selectedOrder.replaceRequest?.status === 'Requested') && (
              <div className="space-y-3">
                {selectedOrder.cancelReason && (
                  <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4">
                    <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Cancel Reason</p>
                    <p className="mt-2 text-sm font-bold text-rose-700">{selectedOrder.cancelReason}</p>
                  </div>
                )}
                {selectedOrder.returnRequest?.status === 'Requested' && (
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Return Request</p>
                    <p className="mt-2 text-sm font-bold text-amber-700">{selectedOrder.returnRequest?.reason}</p>
                  </div>
                )}
                {selectedOrder.replaceRequest?.status === 'Requested' && (
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Replacement Request</p>
                    <p className="mt-2 text-sm font-bold text-blue-700">{selectedOrder.replaceRequest?.reason}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaceOrder;
