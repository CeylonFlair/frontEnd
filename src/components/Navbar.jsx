import React, { useState, useRef } from "react";
import api from "../../utils/api";
import "./ResetPassword.scss";
import { useLocation, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const prefillEmail = location.state?.email || "";
  const [email, setEmail] = useState(prefillEmail);
  const [otpArr, setOtpArr] = useState(Array(6).fill(""));
  const otpRefs = useRef([]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");

  const getOtp = () => otpArr.join("");

  const handleOtpChange = (e, idx) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    if (!val) return;
    const newArr = [...otpArr];
    newArr[idx] = val[val.length - 1];
    setOtpArr(newArr);
    if (idx < 5 && val) {
      otpRefs.current[idx + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === "Backspace") {
      if (otpArr[idx]) {
        const newArr = [...otpArr];
        newArr[idx] = "";
        setOtpArr(newArr);
      } else if (idx > 0) {
        otpRefs.current[idx - 1]?.focus();
        const newArr = [...otpArr];
        newArr[idx - 1] = "";
        setOtpArr(newArr);
      }
    } else if (e.key === "ArrowLeft" && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    } else if (e.key === "ArrowRight" && idx < 5) {
      otpRefs.current[idx + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "");
    if (paste.length === 6) {
      setOtpArr(paste.split(""));
      otpRefs.current[5]?.focus();
      e.preventDefault();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    const otp = getOtp();
    if (!email || !otp || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/reset-password", {
        otp,
        password: newPassword,
        email,
      });
      setSuccessMsg(res.data?.message || "Password reset successful!");
      setTimeout(() => {
        navigate("/login");
      }, 2000); // Show message for 2 seconds before navigating
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to reset password. Please try again."
      );
    }
    setLoading(false);
  };

  return (
    <div className="reset-password">
      <form onSubmit={handleSubmit}>
        <h2>Reset Password</h2>
        <label htmlFor="reset-email">Email</label>
        <input
          id="reset-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="your@email.com"
          disabled
        />
        <label>OTP</label>
        <div
          style={{
            display: "flex",
            gap: "8px",
            justifyContent: "center",
            marginBottom: "8px",
          }}
          onPaste={handleOtpPaste}
        >
          {otpArr.map((digit, idx) => (
            <input
              key={idx}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              ref={(el) => (otpRefs.current[idx] = el)}
              onChange={(e) => handleOtpChange(e, idx)}
              onKeyDown={(e) => handleOtpKeyDown(e, idx)}
              style={{
                width: "40px",
                height: "48px",
                fontSize: "2rem",
                textAlign: "center",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
              disabled={loading}
              autoFocus={idx === 0}
            />
          ))}
        </div>
        <label htmlFor="reset-password">New Password</label>
        <input
          id="reset-password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          placeholder="New password"
        />
        <label htmlFor="reset-confirm-password">Confirm New Password</label>
        <input
          id="reset-confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          placeholder="Confirm new password"
        />
        <button
          type="submit"
          disabled={loading}
          className={loading ? "btn-disabled" : ""}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
        {error && <div className="error">{error}</div>}
        {successMsg && <div className="success-pw-reset">{successMsg}</div>}
      </form>
    </div>
  );
};

export default ResetPassword;
