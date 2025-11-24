import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import API_CONFIG from "../config/api";
import ApiService from "../services/api.service";

export default function ChangePassword() {
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpModalVisible, setOtpModalVisible] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setEmail("");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setOtp("");
  }, []);

  const handleSendOtp = async () => {
    if (!email) {
      toast.error("Please enter email");
      return;
    }

    try {
      const response = await ApiService.post(API_CONFIG.ENDPOINTS.SEND_OTP, {
        username: email,
      });

      if (response.ok) {
        toast.success("OTP sent");
        setOtpModalVisible(true);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "OTP sending failed");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Failed to send OTP");
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    const resetPasswordMode = oldPassword ? "CHANGE_PASSWORD" : "RESET_PASSWORD";

    try {
      const response = await ApiService.post(API_CONFIG.ENDPOINTS.CHANGE_PASSWORD, {
        resetPassword: resetPasswordMode,
        username: email,
        oldPassword,
        newPassword,
        confirmPassword,
        otp,
      });

      if (response.ok) {
        toast.success("Password changed successfully");
        
        // Clear all fields
        setEmail("");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setOtp("");
        
        setTimeout(() => {
          navigate("/admin/login", { replace: true });
        }, 1500);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message);
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Failed to change password");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-2xl font-bold text-center text-indigo-700 mb-4">
          Change Password
        </h2>

        <div className="space-y-6">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off"
            className="w-full p-3 border rounded-md"
          />

          <input
            type="password"
            placeholder="Old Password (leave empty if forgot)"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            autoComplete="off"
            className="w-full p-3 border rounded-md"
          />

          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="off"
            className="w-full p-3 border rounded-md"
          />

          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="off"
            className="w-full p-3 border rounded-md"
          />

          {!oldPassword && (
            <button
              type="button"
              onClick={handleSendOtp}
              className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700"
            >
              Send OTP
            </button>
          )}

          {oldPassword && (
            <button
              type="button"
              onClick={handleChangePassword}
              className="w-full bg-green-600 text-white p-3 rounded-md hover:bg-green-700"
            >
              Change Password
            </button>
          )}
        </div>
      </div>

      {otpModalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h3 className="text-lg font-semibold text-center mb-2">Enter OTP</h3>

            <input
              type="text"
              placeholder="OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-3 border rounded-md"
            />

            <button
              onClick={() => {
                setOtpModalVisible(false);
                handleChangePassword();
              }}
              className="w-full mt-3 bg-green-600 text-white p-3 rounded-md hover:bg-green-700"
            >
              Verify OTP & Change Password
            </button>
          </div>
        </div>
      )}
    </div>
  );
}