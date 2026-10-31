import api from "./Api";

const getError = (error, fallback) => ({
  message: error.response?.data?.message || error.message || fallback,
  ...error.response?.data,
});

const AuthService = {
  register: async (name, email, password, role) => {
    try {
      const response = await api.post(`/api/${role}/register`, { name, email, password });
      return response.data;
    } catch (error) {
      throw getError(error, "Registration failed");
    }
  },

  login: async (email, password, role) => {
    try {
      const normalizedRole = role === "admin" ? "admin" : "user";
      const response = await api.post(`/api/${normalizedRole}/login`, {
        email: email.trim(),
        password,
      });
      return response.data;
    } catch (error) {
      throw getError(error, "Login failed");
    }
  },

  googleLogin: async (credential) => {
    try {
      const response = await api.post("/api/user/google", { credential });
      return response.data;
    } catch (error) {
      throw getError(error, "Google sign-in failed");
    }
  },

  logout: async (role = "user") => {
    try {
      const endpoint = role === "admin" ? "/api/admin/logout" : "/api/user/logout";
      const response = await api.post(endpoint);
      return response.data;
    } catch (error) {
      throw getError(error, "Logout failed");
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get("/api/user/session", { skipAuthRedirect: true });
      return response.data;
    } catch (error) {
      throw getError(error, "Failed to fetch user");
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await api.put("/api/user/update-profile", profileData);
      return response.data;
    } catch (error) {
      throw getError(error, "Failed to update profile");
    }
  },

  uploadProfileImage: async (imageFile) => {
    try {
      if (!(imageFile instanceof File)) {
        throw new Error("Please select an image to upload");
      }

      const formData = new FormData();
      formData.append("image", imageFile);
      // Let the browser set the multipart boundary for FormData.
      const response = await api.post("/api/user/upload-profile-image", formData, {
        headers: { "Content-Type": undefined },
      });
      return response.data;
    } catch (error) {
      throw getError(error, "Failed to upload image");
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.put("/api/user/change-password", { currentPassword, newPassword });
      return response.data;
    } catch (error) {
      throw getError(error, "Failed to change password");
    }
  },

  deleteAccount: async (password) => {
    try {
      const response = await api.delete("/api/user/delete-account", { data: { password } });
      return response.data;
    } catch (error) {
      throw getError(error, "Failed to delete account");
    }
  },

  sendForgotPasswordOtp: async (email) => {
    try { return (await api.post("/api/user/forgot-password/send-otp", { email })).data; }
    catch (error) { throw getError(error, "Failed to send OTP"); }
  },

  verifyForgotPasswordOtp: async (email, otp) => {
    try { return (await api.post("/api/user/forgot-password/verify-otp", { email, otp })).data; }
    catch (error) { throw getError(error, "Failed to verify OTP"); }
  },
  
  resetPasswordWithOtp: async (email, newPassword) => {
    try { return (await api.post("/api/user/forgot-password/reset-password", { email, newPassword })).data; }
    catch (error) { throw getError(error, "Failed to reset password"); }
  },
};

export default AuthService;
