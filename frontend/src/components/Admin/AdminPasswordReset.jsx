import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { server } from "../../server";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/styles";

const AdminPasswordReset = ({ email }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const resetPassword = async () => {
    if (password !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }
    try {
      const response = await axios.put(`${server}/admin/admin-reset-password`, {
        email,
        newPassword: password,
      });
      if (response.data.success) {
        toast.success("Password has been reset successfully.");
        navigate("/admin/dashboard");
      } else {
        toast.error("Failed to reset password.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "An error occurred while resetting password."
      );
    }
  };

  return (
    <>
      <p className="mt-6 mb-2 text-center text-2xl font-weight:300 text-gray-700">
        Reset Password
      </p>
      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          resetPassword();
        }}
      >
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            New Password
          </label>
          <div className="mt-1">
            <input
              type="password"
              name="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="confirm-password"
            className="block text-sm font-medium text-gray-700"
          >
            Confirm New Password
          </label>
          <div className="mt-1">
            <input
              type="password"
              name="confirm-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
        <div>
          <button type="submit" className={`${styles.wideButton}`}>
            Reset Password
          </button>
        </div>
      </form>
    </>
  );
};

export default AdminPasswordReset;
