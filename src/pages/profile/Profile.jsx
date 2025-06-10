import React, { useEffect, useState, useRef } from "react";
import api from "../../utils/api";
import countryCodes from "../../utils/countryCodes";
import countries from "../../utils/countries";
import "./Profile.scss";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [showChangePw, setShowChangePw] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const fileInputRef = useRef();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        // Extract country code and phone from contactNumber
        let code = "";
        let phone = "";
        if (res.data.contactNumber) {
          const match = res.data.contactNumber.match(/^\((\d+)\)\s*(.*)$/);
          if (match) {
            code = match[1];
            phone = match[2];
          }
        }
        setCountryCode(code || "94");
        setForm({
          name: res.data.name || "",
          email: res.data.email || "",
          contactNumber: phone || "",
          country: res.data.country || "",
          description: res.data.description || "",
        });
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load profile information."
        );
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleEdit = () => {
    setEditMode(true);
    setSuccessMsg("");
    setError("");
  };

  const handleCancel = () => {
    setEditMode(false);
    setFile(null);
    setSuccessMsg("");
    setError("");
    // Reset form to user data
    setForm({
      name: user.name || "",
      email: user.email || "",
      contactNumber: user.contactNumber || "",
      country: user.country || "",
      description: user.description || "",
    });
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMsg("");
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append(
        "contactNumber",
        `(${countryCode}) ${form.contactNumber}`
      );
      formData.append("country", form.country);
      formData.append("description", form.description);
      if (file) {
        formData.append("profilePicture", file);
      }
      const res = await api.put("/users/me", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setUser(res.data.user);
      setEditMode(false);
      setFile(null);
      setSuccessMsg("Profile updated successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    }
    setSaving(false);
  };

  const handleChangePw = async (e) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");
    setPwLoading(true);
    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/users/change-password",
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPwSuccess("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setTimeout(() => {
        setShowChangePw(false);
        setPwSuccess("");
      }, 2000); // Hide after 2 seconds
    } catch (err) {
      setPwError(err.response?.data?.message || "Failed to change password.");
    }
    setPwLoading(false);
  };

  if (loading)
    return (
      <div className="profile">
        <p>Loading...</p>
      </div>
    );
  if (error)
    return (
      <div className="profile">
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  if (!user) return null;

  return (
    <div className="profile">
      <div className="profile-card">
        <h2>Profile</h2>
        <div className="profile-img-wrapper">
          {file || user.profilePicture || user.img ? (
            <img
              src={
                file
                  ? URL.createObjectURL(file)
                  : user.profilePicture || user.img
              }
              alt="Profile"
              className="profile-img"
            />
          ) : (
            <div className="profile-img profile-img-placeholder">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="#e0dede">
                <circle cx="12" cy="8" r="4" />
                <path d="M12 14c-4.418 0-8 1.79-8 4v2h16v-2c0-2.21-3.582-4-8-4z" />
              </svg>
            </div>
          )}
        </div>
        {editMode ? (
          <form onSubmit={handleSubmit} className="profile-edit-form">
            <div className="profile-row">
              <span className="profile-label">Profile Image:</span>
              <label className="profile-upload-btn">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  style={{ display: "none" }}
                />
                <span>
                  <svg
                    width="20"
                    height="20"
                    fill="#bf7e7e"
                    style={{
                      verticalAlign: "middle",
                      marginRight: 6,
                    }}
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 16.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5zm6.5-10h-2.79l-.94-1.34C14.29 4.52 13.7 4 13 4h-2c-.7 0-1.29.52-1.77 1.16L8.29 6.5H5.5C4.12 6.5 3 7.62 3 9v10c0 1.38 1.12 2.5 2.5 2.5h13c1.38 0 2.5-1.12 2.5-2.5V9c0-1.38-1.12-2.5-2.5-2.5zM12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" />
                  </svg>
                  {file ? file.name : "Choose Image"}
                </span>
              </label>
            </div>
            <div className="profile-row">
              <span className="profile-label">Name:</span>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="profile-input"
              />
            </div>
            <div className="profile-row">
              <span className="profile-label">Email:</span>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                className="profile-input"
              />
            </div>
            <div className="profile-row">
              <span className="profile-label">Contact Number:</span>
              <div style={{ display: "flex", gap: 8, flex: 1 }}>
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="profile-input"
                  style={{ maxWidth: 110, minWidth: 90 }}
                  required
                >
                  {countryCodes.map((c) => (
                    <option key={c.code} value={c.code}>
                      +{c.code} ({c.name})
                    </option>
                  ))}
                </select>
                <input
                  name="contactNumber"
                  value={form.contactNumber}
                  onChange={handleChange}
                  className="profile-input"
                  placeholder="e.g. 778294890"
                  style={{ flex: 1 }}
                  required
                />
              </div>
            </div>
            <div className="profile-row">
              <span className="profile-label">Country:</span>
              <select
                name="country"
                value={form.country}
                onChange={handleChange}
                className="profile-input"
                required
              >
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
            <div className="profile-row">
              <span className="profile-label">Description:</span>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={2}
                className="profile-input"
              />
            </div>
            <div className="profile-btn-row">
              <button
                type="submit"
                className={saving ? "btn-disabled" : "profile-btn-save"}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="profile-btn-cancel"
              >
                Cancel
              </button>
            </div>
            {error && <div className="error">{error}</div>}
            {successMsg && <div className="success-pw-reset">{successMsg}</div>}
          </form>
        ) : (
          <>
            <div className="profile-row">
              <span className="profile-label">Name:</span>
              <span>{user.name}</span>
            </div>
            <div className="profile-row">
              <span className="profile-label">Email:</span>
              <span>{user.email}</span>
            </div>
            <div className="profile-row">
              <span className="profile-label">Contact Number:</span>
              <span>{user.contactNumber}</span>
            </div>
            <div className="profile-row">
              <span className="profile-label">Country:</span>
              <span>{user.country}</span>
            </div>
            <div className="profile-row">
              <span className="profile-label">Role:</span>
              <span>{user.roles?.join(", ")}</span>
            </div>
            <div className="profile-row">
              <span className="profile-label">Verified:</span>
              <span
                style={{
                  color: user.isVerified ? "#27ae60" : "#c0392b",
                  fontWeight: 600,
                }}
              >
                {user.isVerified ? "Yes" : "No"}
              </span>
            </div>
            <div className="profile-row">
              <span className="profile-label">Description:</span>
              <span>{user.description}</span>
            </div>
            <div className="profile-row">
              <span className="profile-label">Joined:</span>
              <span>{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="profile-btn-row">
              <button
                onClick={handleEdit}
                className={saving ? "btn-disabled" : "profile-btn-edit"}
                disabled={saving}
              >
                Edit Profile
              </button>
              <button
                type="button"
                className={
                  pwLoading
                    ? "btn-disabled profile-btn-edit"
                    : "profile-btn-edit"
                }
                style={{ background: "#6a9fb5", marginLeft: 8 }}
                onClick={() => setShowChangePw((v) => !v)}
                disabled={pwLoading || saving}
              >
                {showChangePw ? "Cancel" : "Change Password"}
              </button>
            </div>
            {showChangePw && (
              <form
                onSubmit={handleChangePw}
                style={{
                  marginTop: 18,
                  background: "#f8f6f8",
                  borderRadius: 8,
                  padding: 18,
                  boxShadow: "0 1px 4px #eee",
                }}
              >
                <div className="profile-row">
                  <span className="profile-label">Old Password:</span>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="profile-input"
                    required
                    disabled={pwLoading}
                  />
                </div>
                <div className="profile-row">
                  <span className="profile-label">New Password:</span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="profile-input"
                    required
                    disabled={pwLoading}
                  />
                </div>
                <div className="profile-btn-row">
                  <button
                    type="submit"
                    className={pwLoading ? "btn-disabled" : "profile-btn-save"}
                    disabled={pwLoading}
                  >
                    {pwLoading ? "Changing..." : "Change Password"}
                  </button>
                </div>
                {pwError && <div className="error">{pwError}</div>}
                {pwSuccess && (
                  <div className="success-pw-reset">{pwSuccess}</div>
                )}
              </form>
            )}
            {successMsg && <div className="success-pw-reset">{successMsg}</div>}
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
