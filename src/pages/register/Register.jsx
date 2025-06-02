import React, { useState } from "react";
import upload from "../../utils/upload";
import "./Register.scss";
import api from "../../utils/api";
import { useNavigate, Link } from "react-router-dom";
import countries from "../../utils/countries";
import countryCodes from "../../utils/countryCodes";

function Register() {
  const [file, setFile] = useState(null);
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    repeat_password: "",
    country: "Sri Lanka",
    roles: ["user"], // default role
    description: "",
  });
  const [countryCode, setCountryCode] = useState("94");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false); // loading state

  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser((prev) => {
      return { ...prev, [e.target.name]: e.target.value };
    });
  };

  const handleSeller = (e) => {
    setUser((prev) => {
      if (e.target.checked) {
        return { ...prev, roles: ["artisan"] };
      } else {
        return { ...prev, roles: ["user"] };
      }
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // start loading
    setError(null);
    // const url = await upload(file);
    try {
      await api.post("/auth/register", {
        ...user,
        country: user.country,
        contactNumber: `(${countryCode}) ${phone}`,
        description: user.description,
        // img: url,
      });
      setSuccess(true); // Show success message
      setTimeout(() => {
        navigate("/verify-email", { state: { email: user.email } });
      }, 2000); // Navigate after 2 seconds
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
      console.log(err);
    } finally {
      setLoading(false); // stop loading
    }
  };
  return (
    <div className="register">
      <form onSubmit={handleSubmit}>
        <div className="left">
          <h1>Create a new account</h1>
          {error && <div style={{ color: "red" }}>{error}</div>}
          {success && (
            <div style={{ color: "green" }}>
              Verification Mail Sent! Redirecting...
            </div>
          )}
          <label htmlFor="">Name</label>
          <input
            name="name"
            type="text"
            placeholder="Your Name"
            onChange={handleChange}
            required
          />
          <label htmlFor="">Email</label>
          <input
            name="email"
            type="email"
            placeholder="Your Email"
            onChange={handleChange}
            required
          />
          <label htmlFor="">Password</label>
          <input
            name="password"
            type="password"
            onChange={handleChange}
            required
          />
          <label htmlFor="">Repeat Password</label>
          <input
            name="repeat_password"
            type="password"
            onChange={handleChange}
            required
          />
          {/* <label htmlFor="">Profile Picture</label>
          <input type="file" onChange={(e) => setFile(e.target.files[0])} /> */}
          <label htmlFor="">Country</label>
          <select
            name="country"
            value={user.country}
            onChange={handleChange}
            required
          >
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={loading}
            className={loading ? "register-btn-disabled" : ""}
          >
            {loading ? "Loading..." : "Register"}
          </button>
          <p>
            Already have an account? <Link to="/login">Login</Link>{" "}
          </p>
        </div>
        <div className="right">
          <h1>I want to become a seller</h1>
          <div className="toggle">
            <label htmlFor="">Activate the seller account</label>
            <label className="switch">
              <input type="checkbox" onChange={handleSeller} />
              <span className="slider round"></span>
            </label>
          </div>
          <label htmlFor="">Phone Number</label>
          <div className="phone-row">
            <select
              name="countryCode"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              required
              className="country-code-select"
            >
              {countryCodes.map((c) => (
                <option key={c.code} value={c.code}>
                  +{c.code} ({c.name})
                </option>
              ))}
            </select>
            <input
              name="phone"
              type="text"
              placeholder="123456789"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="phone-input"
            />
          </div>
          <label htmlFor="">Description</label>
          <textarea
            placeholder="A short description of yourself"
            name="description"
            id=""
            cols="30"
            rows="10"
            onChange={handleChange}
          ></textarea>
        </div>
      </form>
    </div>
  );
}

export default Register;
