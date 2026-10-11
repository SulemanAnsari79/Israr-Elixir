import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FiMenu, FiX, FiLogOut } from "react-icons/fi";
import { AuthContext } from "../context/AuthContext";

const AdminNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-[#e9e1d7] bg-[#fffdfa]/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
        <div className="flex items-center justify-end">
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg border border-[#e9e1d7] px-4 py-2 text-sm font-medium text-[#655541] transition hover:bg-[#f5efe7]"
            >
              <FiLogOut size={20} />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-lg p-2 text-[#655541] transition hover:bg-[#f5efe7]"
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="mt-4 space-y-3 border-t border-[#e9e1d7] pt-4 pb-4 md:hidden">
            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg border border-[#e9e1d7] px-4 py-2 text-sm font-medium text-[#655541] transition hover:bg-[#f5efe7]"
            >
              <FiLogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AdminNavbar;
