import React, { useState } from "react";
import api from "../../utils/api";
import "./ForgotPassword.scss";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/reset-password-request", { email });
      setSubmitted(res.data?.message || true);
      setTimeout(() => {
        navigate("/reset-password", { state: { email } });
      }, 2000); // Show message for 2 seconds before navigating
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to send reset link. Please try again."
      );
    }
    setLoading(false);
  };

  return (
    <div className="forgot-password">
      <form onSubmit={handleSubmit}>
        <h2>Forgot Password</h2>
        {submitted ? (
          <div className="success-pw-reset">
            {typeof submitted === "string"
              ? submitted
              : "A reset OTP has been sent to your email address."}
          </div>
        ) : (
          <>
            <label htmlFor="forgot-email">Enter your email address</label>
            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />
            <button
              type="submit"
              disabled={loading}
              className={loading ? "btn-disabled" : ""}
            >
              {loading ? "Sending..." : "Send Reset OTP"}
            </button>
            {error && <div className="error">{error}</div>}
          </>
        )}
      </form>
    </div>
  );
};

export default ForgotPassword;
