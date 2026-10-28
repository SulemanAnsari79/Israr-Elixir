import React, { useEffect, useState, useContext } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContextDefinition";
import AuthService from "../../services/AuthService";
import OrderService from "../../services/OrderService";
// import { getMyBookedAppointments } from "../../services/DoctorService.js";
import { 
  UserCircleIcon, 
  Settings02Icon, 
  PackageIcon, 
  Calendar03Icon, 
  Logout01Icon, 
  Camera01Icon, 
  Key01Icon, 
  Delete02Icon,
  CheckmarkBadge01Icon,
  Mail01Icon,
  // Call01Icon,
  Location01Icon
} from 'hugeicons-react';

const Profile = () => {
  const { logout, navigate } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [profileImage, setProfileImage] = useState("https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop");
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [ordersCount, setOrdersCount] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const data = await AuthService.getCurrentUser();
      setName(data.user.name || "");
      setEmail(data.user.email || "");
      setPhone(data.user.phone || "");
      setAddress(data.user.address || "");
      if (data.user.image) {
        setProfileImage(data.user.image);
        setPreviewImage(data.user.image);
      } else {
        setPreviewImage(profileImage);
      }
    } catch {
      toast.error("Failed to load profile");
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const [ordersResponse] = await Promise.allSettled([
          OrderService.getUserOrders()
        ]);

        if (ordersResponse.status === "fulfilled") {
          const orders = Array.isArray(ordersResponse.value?.orders)
            ? ordersResponse.value.orders
            : [];
          setOrdersCount(orders.length);
        }
      } catch (error) {
        console.error("Failed to load user stats", error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const UpdateHandler = async (e) => {
    e.preventDefault();
    const response = await AuthService.updateProfile({ name, email, phone, address });
    if (response.success) {
      toast.success("Profile Updated Successfully!");
      fetchProfile();
    } else {
      toast.error(response.message || "Update failed");
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImage = async () => {
    if (!imageFile) {
      toast.error("Please select an image first");
      return;
    }

    setImageUploading(true);
    try {
      const response = await AuthService.uploadProfileImage(imageFile);
      if (response.success) {
        toast.success("Avatar updated!");
        setImageFile(null);
        fetchProfile();
      }
    } catch (error) {
      toast.error(error.message || "Upload failed");
    } finally {
      setImageUploading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.error("All password fields are required");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await AuthService.changePassword(currentPassword, newPassword);
      if (response.success) {
        toast.success(response.message || "Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setShowChangePasswordModal(false);
      } else {
        toast.error(response.message || "Password update failed");
      }
    } catch (error) {
      toast.error(error.message || "Password update failed");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();

    if (!deletePassword) {
      toast.error("Password is required to close your account");
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await AuthService.deleteAccount(deletePassword);
      if (response.success) {
        toast.success(response.message || "Account closed successfully");
        setShowDeleteAccountModal(false);
        setDeletePassword("");
        logout();
        navigate("/login");
      } else {
        toast.error(response.message || "Account deletion failed");
      }
    } catch (error) {
      toast.error(error.message || "Account deletion failed");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="profile-page store-page min-h-screen font-['Plus_Jakarta_Sans']">
      <Navbar />

      <main className="profile-layout mx-auto px-4 py-8 sm:px-6 md:py-12 xl:px-8 xl:py-16">
        <div className="grid gap-6 lg:grid-cols-[minmax(240px,300px)_minmax(0,1fr)] xl:gap-8">
          
          {/* LEFT: THE IDENTITY CARD */}
          <aside className="space-y-5 xl:space-y-6">
            <div className="relative overflow-hidden rounded-md border border-slate-100 bg-white p-6 text-center shadow-[0_20px_50px_rgba(0,0,0,0.02)] xl:rounded-xl xl:p-8">
             
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50 -mr-16 -mt-16"></div>
              
              <div className="relative inline-block mb-6">
                <div className="relative group">
                  <img src={previewImage} alt="User" className="mx-auto rounded-full ring-1 object-cover transition-all group-hover:scale-95 xl:h-40 xl:w-40 "/>
                  <label htmlFor="image-input" className="absolute -bottom-2 -right-2 bg-slate-900 text-white p-3 rounded-2xl cursor-pointer hover:bg-[#1A56DB] transition-all shadow-xl">
                    <Camera01Icon size={20} variant="bulk" />
                  </label>
                </div>
                <input id="image-input" type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
              </div>

              {imageFile && (
                <div className="mb-6 flex gap-2 animate-in fade-in slide-in-from-top-4">
                  <button onClick={handleUploadImage} disabled={imageUploading} className="flex-1 bg-[#1A56DB] text-white py-2 rounded-md  text-xs font-black uppercase tracking-widest disabled:opacity-50">
                    {imageUploading ? "Syncing..." : "Apply"}
                  </button>
                  <button onClick={() => { setImageFile(null); setPreviewImage(profileImage); }} className="flex-1 bg-slate-100 text-slate-400 py-2 rounded-md  text-xs font-black uppercase tracking-widest">
                    Cancel
                  </button>
                </div>
              )}

              <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
                  {name} <CheckmarkBadge01Icon size={18} className="text-blue-500" variant="bulk" />
                </h2>
                <p className="text-slate-400 font-bold text-sm tracking-tight">{email}</p>
              </div>

              <div className="mt-6 space-y-3 border-t border-slate-50 pt-6 xl:mt-8 xl:pt-8">
                <button onClick={logout} className="w-full flex items-center justify-center gap-3 bg-rose-50 text-rose-600 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-rose-100 transition-all group">
                  <Logout01Icon size={18} variant="bulk" className="group-hover:translate-x-1 transition-transform" />
                  Sign Out
                </button>
              </div>
            </div>

            {/* QUICK STATS BENTO */}
            <button onClick={() => navigate('/place-order')}  className="grid grid-cols-2 gap-3 xl:gap-4">
               <div className="rounded-3xl border border-slate-100 bg-white p-4 text-center xl:p-6">
                  <PackageIcon size={24} className="mx-auto text-blue-500 mb-2" variant="bulk" />
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Orders</p>
                <p className="text-xl font-black text-slate-900">{statsLoading ? "--" : String(ordersCount).padStart(2, "0")}</p>
               </div>
            </button>
          </aside>

          {/* RIGHT: THE SETTINGS HUB */}
          <div className="space-y-6 xl:space-y-8">
            
            {/* PROFILE FORM */}
            <div className="rounded-md border border-slate-100 bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.02)] md:p-8 xl:rounded-xl xl:p-12">
              <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3 uppercase tracking-widest text-[11px]">
                <UserCircleIcon size={20} className="text-[#1A56DB]" variant="bulk" />
                My Profile
              </h3>

              <form onSubmit={UpdateHandler} className="space-y-6 xl:space-y-8">
                <div className="grid gap-6 md:grid-cols-2 xl:gap-8">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase ml-4 tracking-widest">Display Name</label>
                    <div className="relative">
                      <UserCircleIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-50 border-none pl-12 p-4 rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase ml-4 tracking-widest">Email Address</label>
                    <div className="relative">
                      <Mail01Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-50 border-none pl-12 p-4 rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase ml-4 tracking-widest">Contact Number</label>
                    <div className="relative">
                      <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase ml-4 tracking-widest">Shipping Base</label>
                    <div className="relative">
                      <Location01Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-slate-50 border-none pl-12 p-4 rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                    </div>
                  </div>
                </div>
                <button type="submit" className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-[#1A56DB] transition-all transform active:scale-95 shadow-xl shadow-slate-200">
                  Save Updates
                </button>
              </form>
            </div>

            {/* SECURITY BOX */}
            <div className="rounded-md  border border-slate-100 bg-white p-6 xl:rounded-xl xl:p-10">
              <h3 className="text-[11px] font-black text-slate-400 mb-8 uppercase tracking-widest flex items-center gap-2">
                <Settings02Icon size={18} /> Account Vault
              </h3>
              <div className="flex flex-wrap gap-4">
                <button onClick={() => setShowChangePasswordModal(true)} className="flex items-center gap-3 px-6 py-3 bg-slate-50 rounded-2xl text-[11px] font-black uppercase text-slate-600 hover:bg-slate-900 hover:text-white transition-all">
                  <Key01Icon size={18} /> Update Password
                </button>
                <button onClick={() => setShowDeleteAccountModal(true)} className="flex items-center gap-3 px-6 py-3 bg-rose-50 rounded-2xl text-[11px] font-black uppercase text-rose-600 hover:bg-rose-600 hover:text-white transition-all">
                  <Delete02Icon size={18} /> Close Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      
      {/* RENDER MODALS... (Keeping your existing logic but wrapping in New UI) */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
           <div className="bg-white rounded-[3rem] shadow-2xl max-w-md w-full p-10 relative border border-white">
              <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tighter">New Password</h3>
              <form onSubmit={handleChangePassword} className="space-y-6">
                 <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current Password" required className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-slate-800 outline-none" />
                 <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New Password" required className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-slate-800 outline-none" />
                 <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} placeholder="Confirm New" required className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-slate-800 outline-none" />
                 <div className="flex gap-3">
               <button type="submit" disabled={passwordLoading} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#1A56DB] disabled:opacity-50">{passwordLoading ? "Updating..." : "Change"}</button>
                   <button type="button" onClick={() => setShowChangePasswordModal(false)} className="flex-1 bg-slate-100 text-slate-400 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">Cancel</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {showDeleteAccountModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl max-w-md w-full p-10 relative border border-white">
            <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tighter">Close Account</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">This will delete your account and associated orders. Enter your password to confirm.</p>
            <form onSubmit={handleDeleteAccount} className="space-y-6">
              <input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} placeholder="Account Password" required className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-slate-800 outline-none" />
              <div className="flex gap-3">
               <button type="submit" disabled={passwordLoading} className="flex-1 bg-rose-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 disabled:opacity-50">{passwordLoading ? "Closing..." : "Close Account"}</button>
               <button type="button" onClick={() => setShowDeleteAccountModal(false)} className="flex-1 bg-slate-100 text-slate-400 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
