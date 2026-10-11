import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar.jsx";
import AdminNavbar from "../components/AdminNavbar.jsx";

const AdminLayout = () => {
  return (
    <div className="admin-shell flex min-h-screen">
      <AdminSidebar />

      <div className="min-w-0 flex-1 bg-gray-100">
        <AdminNavbar />
        <div className="p-4 md:p-7">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
