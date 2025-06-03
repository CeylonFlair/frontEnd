import React, { useState } from "react";
import api from "../../utils/api";
import { Link, useNavigate } from "react-router-dom";
import "./Login.scss";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, message } = res.data;
      localStorage.setItem("token", token);

      // Fetch user info and store in localStorage
      const userRes = await api.get("/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.setItem("user", JSON.stringify(userRes.data));

      setSuccess(message || "Login successful!");

      setTimeout(() => {
        navigate("/"); // redirect to home or dashboard
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
    setLoading(false);
  };

  return (
    <div className="login">
      <form onSubmit={handleSubmit}>
        <h1>Sign in</h1>
        {error && <div className="login-error">{error}</div>}
        {success && <div className="login-success">{success}</div>}

        <label htmlFor="">Email</label>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="">Password</label>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div style={{ textAlign: "right", marginBottom: "8px" }}>
          <Link to="/forgot-password" style={{ fontSize: "14px" }}>
            Forgot password?
          </Link>
        </div>
        <button
          type="submit"
          disabled={loading}
          className={loading ? "btn-disabled" : ""}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <p>
          Don't have account? <Link to="/register">Sign up</Link>{" "}
        </p>
      </form>
    </div>
  );
}

export default Login;
