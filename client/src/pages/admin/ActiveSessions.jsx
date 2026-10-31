import { useEffect, useState } from "react";
import { FiLoader, FiRefreshCw, FiSlash } from "react-icons/fi";
import { toast } from "react-toastify";
import { getActiveSessions, revokeSession, revokeUserSessions } from "../../services/AdminService.js";

const formatDate = (value) => new Date(value).toLocaleString();

const ActiveSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionKey, setActionKey] = useState("");

  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await getActiveSessions();
      setSessions(response.data.sessions || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load active sessions");
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (session) => {
    if (!window.confirm(`Force logout ${session.user?.name || "this device"}?`)) return;
    try {
      setActionKey(session.sessionId);
      await revokeSession(session.sessionId);
      toast.success("Selected device logged out");
      await loadSessions();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to revoke session");
    } finally {
      setActionKey("");
    }
  };

  const handleRevokeAll = async (session) => {
    if (!window.confirm(`Log out ${session.user?.name || "this user"} from all devices?`)) return;
    try {
      const key = `all:${session.user?._id}`;
      setActionKey(key);
      await revokeUserSessions(session.user._id);
      toast.success("User logged out from all devices");
      await loadSessions();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to revoke user sessions");
    } finally {
      setActionKey("");
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  return (
    <section className="min-h-screen">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Active Sessions</h1>
          <p className="mt-2 text-gray-600">Monitor currently active user sessions ({sessions.length})</p>
        </div>
        <button type="button" onClick={loadSessions} className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#e9e1d7] px-4 py-2 text-sm font-medium text-[#655541] hover:bg-[#f5efe7]">
          <FiRefreshCw size={16} /> Refresh
        </button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-16"><FiLoader className="animate-spin text-2xl text-blue-500" /></div>
      ) : sessions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#e9e1d7] p-10 text-center text-gray-600">No active user sessions found.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#e9e1d7] bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#f5efe7] text-[#655541]">
              <tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Created</th><th className="px-4 py-3">Last activity</th><th className="px-4 py-3">IP address</th><th className="px-4 py-3">Device</th><th className="px-4 py-3">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-[#e9e1d7]">
              {sessions.map((session) => (
                <tr key={session.sessionId}>
                  <td className="px-4 py-3"><div className="font-medium text-gray-900">{session.user?.name || "Unknown"}</div><div className="text-gray-500">{session.user?.email || "—"}</div></td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">{formatDate(session.createdAt)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">{formatDate(session.lastActivityAt)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">{session.ipAddress || "—"}</td>
                  <td className="max-w-xs px-4 py-3 text-gray-600">{session.userAgent || "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex flex-col items-start gap-2">
                      <button type="button" disabled={Boolean(actionKey)} onClick={() => handleRevokeSession(session)} className="inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-800 disabled:opacity-50">
                        <FiSlash size={14} /> Force logout device
                      </button>
                      <button type="button" disabled={Boolean(actionKey)} onClick={() => handleRevokeAll(session)} className="text-sm font-medium text-red-600 hover:text-red-800 disabled:opacity-50">
                        Log out all devices
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default ActiveSessions;
