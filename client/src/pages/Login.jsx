import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, User as UserIcon } from "lucide-react";
import { toast } from "react-toastify";
import AuthService from "../services/AuthService";
import { AuthContext } from "../context/AuthContextDefinition";
import PasswordStrengthIndicator from "../components/PasswordStrengthIndicator";
import { GoogleLogin } from "@react-oauth/google";
import api from "../services/Api";

const LOGIN_BG_IMAGE = "";
const LOGO = "";


export default function Login() {
  const [role, setRole] = useState("user"); // 'user' | 'admin'
  const [mode, setMode] = useState("login"); // 'login' | 'signup' | 'forgot'
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: ""});
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [forgotStep, setForgotStep] = useState("sendOtp"); // sendOtp | verifyOtp | resetPassword
  const [otp, setOtp] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [confirmResetPassword, setConfirmResetPassword] = useState("");
  const [storefront, setStorefront] = useState({ login: {} });

  const { login: contextLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/storefront").then(({ data }) => {
      if (data?.storefront) setStorefront(data.storefront);
    }).catch(() => {});
  }, []);

  const roles = [
    { value: "user", label: "User", icon: "👤" },
    { value: "admin", label: "Admin", icon: "⚙️" },
  ];

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error for this field when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  // Validate email format
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate form inputs
  const validateForm = () => {
    const newErrors = {};

    if (mode === "signup" && !form.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(form.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (mode === "login" && !form.password.trim()) {
      newErrors.password = "Password is required";
    }

    if (mode === "signup" && form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (mode === "forgot" && forgotStep === "verifyOtp" && !otp.trim()) {
      newErrors.otp = "OTP is required";
    }

    if (mode === "forgot" && forgotStep === "resetPassword") {
      if (!resetPassword.trim()) {
        newErrors.resetPassword = "New password is required";
      } else if (resetPassword.length < 6) {
        newErrors.resetPassword = "Password must be at least 6 characters";
      }

      if (!confirmResetPassword.trim()) {
        newErrors.confirmResetPassword = "Confirm password is required";
      } else if (resetPassword !== confirmResetPassword) {
        newErrors.confirmResetPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    try {
      if (role === "doctor") {
        const response = await AuthService.doctorRegister(
          form.name,
          form.email,
          form.password
        );
        if (response.success || response.message) {
          toast.success(response.message || "Registered successfully! Please wait for admin verification.");
          setForm({ name: "", email: "", password: "" });
          setMode("login");
        } else {
          // Handle password validation errors from server
          if (response.issues && Array.isArray(response.issues)) {
            toast.error("Password requirements: " + response.issues.join(", "));
          } else {
            toast.error(response.message || "Registration failed. Please try again.");
          }
        }
      } else {
        const response = await AuthService.register(form.name, form.email, form.password, role);
        if (response.success || response.message) {
          toast.success(response.message || "Registered successfully! Please login.");
          setForm({ name: "", email: "", password: "" });
          setMode("login");
        } else {
          // Handle password validation errors from server
          if (response.issues && Array.isArray(response.issues)) {
            toast.error("Password requirements: " + response.issues.join(", "));
          } else {
            toast.error(response.message || "Registration failed. Please try again.");
          }
        }
      }
    } catch (error) {
      const errorMsg = error.response?.data?.issues 
        ? "Password requirements: " + error.response.data.issues.join(", ")
        : error.message || "Registration failed";
      toast.error(errorMsg);
      console.error("Register error details:", error);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await AuthService.login(form.email, form.password, role);

      if (!response.success || !response.user) {
        throw new Error(response.message || "Login failed! Invalid response.");
      }

      contextLogin(response.user);
      toast.success(response.message || "Logged in successfully!");
      navigate(role === "admin" ? "/admin" : "/");
    } catch (error) {
      const errorMsg = error.message || "Login failed";
      toast.error(errorMsg);
      console.error("Login error:", error);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error("Google sign-in did not return a credential.");
      return;
    }

    setLoading(true);
    try {
      const response = await AuthService.googleLogin(credentialResponse.credential);
      if (!response.success || !response.user) {
        throw new Error(response.message || "Google sign-in failed");
      }

      contextLogin({ ...response.user, role: "user" });
      toast.success("Signed in with Google successfully!");
      navigate("/");
    } catch (error) {
      toast.error(error.message || "Google sign-in failed");
      console.error("Google sign-in error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    try {
      if (forgotStep === "sendOtp") {
        const response = await AuthService.sendForgotPasswordOtp(form.email);
        if (response.success) {
          toast.success(response.message || "OTP sent to your email");
          setForgotStep("verifyOtp");
        } else {
          toast.error(response.message || "Failed to send OTP");
        }
        return;
      }

      if (forgotStep === "verifyOtp") {
        const response = await AuthService.verifyForgotPasswordOtp(form.email, otp);
        if (response.success) {
          toast.success(response.message || "OTP verified");
          setForgotStep("resetPassword");
        } else {
          toast.error(response.message || "Invalid OTP");
        }
        return;
      }

      if (forgotStep === "resetPassword") {
        const response = await AuthService.resetPasswordWithOtp(form.email, resetPassword);
        if (response.success) {
          toast.success(response.message || "Password reset successfully");
          setMode("login");
          setForgotStep("sendOtp");
          setOtp("");
          setResetPassword("");
          setConfirmResetPassword("");
          setForm({ name: "", email: "", password: "" });
          setErrors({});
        } else {
          toast.error(response.message || "Failed to reset password");
        }
      }
    } catch (error) {
      toast.error(error.message || "Forgot password request failed");
      console.error("Forgot password error:", error);
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (mode === "signup") {
        await handleRegister();
      } else if (mode === "login") {
        await handleLogin();
      } else if (mode === "forgot") {
        await handleForgotPassword();
      }
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedRole = roles.find(r => r.value === role);

  return (
    <div
      className="login-page relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-950"
      style={{
        backgroundImage: `linear-gradient(rgba(2, 6, 23, 0.68), rgba(2, 6, 23, 0.82)), url('${storefront.login?.backgroundImage || LOGIN_BG_IMAGE}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(56,189,248,0.2),transparent_35%),radial-gradient(circle_at_80%_90%,rgba(34,197,94,0.15),transparent_40%)]" />
      <div className="relative max-w-5xl w-full bg-white/96 shadow-[0_20px_80px_rgba(2,6,23,0.45)] rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 border border-white/30 backdrop-blur-sm">
        <div className="flex items-center justify-center p-6 md:p-8 order-1">
          <div className="text-white text-center px-4 md:px-6">
            {storefront.login?.logoImage || LOGO ? <img src={storefront.login?.logoImage || LOGO} alt={`${storefront.brandName || "Store"} logo`} className="mx-auto mb-6 h-32 w-32 rounded-full object-cover shadow-lg" /> : null}
            <h2 className="font-serif text-2xl tracking-[.12em] md:text-3xl">Welcome to  Israr Elixir</h2>
          </div>
        </div>

        <div className="p-6 md:p-8 order-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl text-white font-semibold">
              {mode === "login" ? "Sign in" : mode === "signup" ? "Create account" : "Reset password"}
            </h3>

            {/* Role Dropdown */}
            <div className="relative border border-white rounded-full">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center justify-center w-10 h-10 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition duration-200"
                title={selectedRole?.label}
              >
                <UserIcon size={18} />
              </button>

              {dropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-black/80 border rounded border-white ">
                  {roles.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => {
                        setRole(r.value);
                        setDropdownOpen(false);
                        setErrors({}); // Clear errors when role changes
                      }}
                      className={`w-full text-white px-4 py-3 flex items-center gap-3 hover:bg-black transition duration-150
                        }`}
                    >
                      <span className="text-lg">{r.icon}</span>
                      <span>{r.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-white">Full name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  required
                  className={`mt-1 text-white/80 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-white">Email address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                required
                className={`mt-1 text-white/80 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="you@example.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              {mode === "forgot" && (
                <p className="mt-1 text-xs text-white/80">
                  {forgotStep === "sendOtp"
                    ? "We will send a 6-digit OTP to this email."
                    : forgotStep === "verifyOtp"
                    ? "Enter the OTP sent to your email."
                    : "Set a new password after OTP verification."}
                </p>
              )}
            </div>

            {mode === "login" || mode === "signup" ? (
              <div>
                <label className="block text-sm font-medium text-white">Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  required
                  className={`mt-1 block text-white/80 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="••••••••"
                />
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                {mode === "signup" && <PasswordStrengthIndicator password={form.password} />}
              </div>
            ) : null}
            {(mode === "login" || mode === "signup") && role === "user" && import.meta.env.VITE_GOOGLE_CLIENT_ID && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs text-white/70">
                  <span className="h-px flex-1 bg-white/30" />
                  <span>OR</span>
                  <span className="h-px flex-1 bg-white/30" />
                </div>
                <GoogleLogin
                  onSuccess={handleGoogleLogin}
                  onError={() => toast.error("Google sign-in was cancelled or failed.")}
                  useOneTap={false}
                  theme="filled_blue"
                  size="large"
                  width="100%"
                  text="continue_with"
                />
              </div>
            )}

            {mode === "forgot" && forgotStep === "verifyOtp" && (
              <div>
                <label className="block text-sm font-medium text-white">Enter OTP</label>
                <input
                  type="text"
                  name="otp"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    if (errors.otp) setErrors({ ...errors, otp: "" });
                  }}
                  required
                  className={`mt-1 text-white/80 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.otp ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter 6-digit OTP"
                />
                {errors.otp && <p className="mt-1 text-sm text-red-500">{errors.otp}</p>}
              </div>
            )}

            {mode === "forgot" && forgotStep === "resetPassword" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-white">New Password</label>
                  <input
                    type="password"
                    name="resetPassword"
                    value={resetPassword}
                    onChange={(e) => {
                      setResetPassword(e.target.value);
                      if (errors.resetPassword) setErrors({ ...errors, resetPassword: "" });
                    }}
                    required
                    className={`mt-1 text-white/80 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2  ${errors.resetPassword ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter new password"
                  />
                  {errors.resetPassword && <p className="mt-1 text-sm text-red-500">{errors.resetPassword}</p>}
                  <PasswordStrengthIndicator password={resetPassword} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmResetPassword"
                    value={confirmResetPassword}
                    onChange={(e) => {
                      setConfirmResetPassword(e.target.value);
                      if (errors.confirmResetPassword) setErrors({ ...errors, confirmResetPassword: "" });
                    }}
                    required
                    className={`mt-1 text-white/80 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.confirmResetPassword ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Confirm new password"
                  />
                  {errors.confirmResetPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmResetPassword}</p>}
                </div>
              </>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="text-sm">
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => {
                      setRole("user");
                      setMode("forgot");
                      setForgotStep("sendOtp");
                      setOtp("");
                      setResetPassword("");
                      setConfirmResetPassword("");
                      setErrors({});
                    }}
                    className="font-medium text-gray-50 hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 bg-black text-white rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Please wait..."
                    : mode === "login"
                    ? "Sign in"
                    : mode === "signup"
                    ? "Create account"
                    : forgotStep === "sendOtp"
                    ? "Send OTP"
                    : forgotStep === "verifyOtp"
                    ? "Verify OTP"
                    : "Reset Password"}
                </button>
              </div>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            {mode === "login" && role !== "delivery" && role !== "admin" ? (
              <>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setForgotStep("sendOtp");
                    setOtp("");
                    setResetPassword("");
                    setConfirmResetPassword("");
                    setErrors({});
                    setForm({ name: "", email: "", password: "" });
                  }}
                  className="text-gray-50 font-medium hover:underline"
                >
                  Sign up
                </button>
              </>
            ) : mode === "login" &&   role === "admin" ? (
              <span className="text-gray-400 text-xs">Account managed by the administrator.</span>
            ) : mode === "signup" ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setForgotStep("sendOtp");
                    setOtp("");
                    setResetPassword("");
                    setConfirmResetPassword("");
                    setErrors({});
                    setForm({ name: "", email: "", password: "" });
                  }}
                  className="text-gray-50 font-medium hover:underline"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Remembered?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setForgotStep("sendOtp");
                    setOtp("");
                    setResetPassword("");
                    setConfirmResetPassword("");
                    setErrors({});
                    setForm({ name: "", email: "", password: ""  });
                  }}
                  className="text-gray-50 font-medium hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
