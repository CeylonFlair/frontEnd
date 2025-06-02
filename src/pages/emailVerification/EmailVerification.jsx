import React, { useState, useRef } from "react";
import "./EmailVerification.scss";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../utils/api";

const EmailVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";

  const [otpArr, setOtpArr] = useState(Array(6).fill(""));
  const inputsRef = useRef([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // Helper to join OTP array to string
  const getOtp = () => otpArr.join("");

  const handleOtpChange = (e, idx) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    if (!val) return;
    const newArr = [...otpArr];
    newArr[idx] = val[val.length - 1];
    setOtpArr(newArr);

    // Move focus to next input
    if (idx < 6 - 1 && val) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === "Backspace") {
      if (otpArr[idx]) {
        // Just clear current
        const newArr = [...otpArr];
        newArr[idx] = "";
        setOtpArr(newArr);
      } else if (idx > 0) {
        // Move to previous
        inputsRef.current[idx - 1]?.focus();
        const newArr = [...otpArr];
        newArr[idx - 1] = "";
        setOtpArr(newArr);
      }
    } else if (e.key === "ArrowLeft" && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    } else if (e.key === "ArrowRight" && idx < 6 - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "");
    if (paste.length === 6) {
      setOtpArr(paste.split(""));
      inputsRef.current[6 - 1]?.focus();
      e.preventDefault();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    const otp = getOtp();
    try {
      const res = await api.post("/auth/verify-email", { email, otp });
      setMessage("Email verified successfully!");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Verification failed. Please check your OTP and try again."
      );
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await api.post("/auth/resend-otp", { email });
      setMessage("OTP resent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP");
    }
    setResendLoading(false);
  };

  return (
    <div className="email-verification">
      <form onSubmit={handleSubmit}>
        <h2>Email Verification</h2>
        <p>
          Please enter the OTP sent to <b>{email || "your email"}</b>
        </p>
        <div
          style={{
            display: "flex",
            gap: "8px",
            justifyContent: "center",
            marginBottom: "8px",
          }}
          onPaste={handlePaste}
        >
          {otpArr.map((digit, idx) => (
            <input
              key={idx}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              ref={(el) => (inputsRef.current[idx] = el)}
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
        <div className="button-row">
          <button
            type="submit"
            disabled={loading}
            className={loading ? "btn-disabled" : ""}
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendLoading || loading}
            className={`resend-btn${
              resendLoading || loading ? " btn-disabled" : ""
            }`}
          >
            {resendLoading ? "Resending..." : "Resend OTP"}
          </button>
        </div>
        {error && <div className="error">{error}</div>}
        {message && <div className="success-email">{message}</div>}
      </form>
    </div>
  );
};

export default EmailVerification;
