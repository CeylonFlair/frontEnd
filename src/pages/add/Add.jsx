import React, { useState } from "react";
import "./Add.scss";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";

const allowedCategories = [
  "Handicraft Artwork",
  "Textile Creation",
  "Home Decor",
  "Jewelry & Accessories",
  "Wellness & Beauty",
  "Ceremonial Arts",
  "Educational Services",
];

const Add = () => {
  const [form, setForm] = useState({
    title: "",
    category: allowedCategories[0],
    description: "",
    price: "",
    deliveryTime: "",
    numberOfRevisions: "",
  });
  const [features, setFeatures] = useState([]);
  const [featureInput, setFeatureInput] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCoverImage = (e) => {
    setCoverImage(e.target.files[0]);
  };

  const handleImages = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleAddFeature = (e) => {
    e.preventDefault();
    const val = featureInput.trim();
    if (val && !features.includes(val)) {
      setFeatures([...features, val]);
      setFeatureInput("");
    }
  };

  const handleRemoveFeature = (idx) => {
    setFeatures(features.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      // Prepare FormData for file upload (multer-style)
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("category", form.category);
      formData.append("description", form.description);
      formData.append("price", Number(form.price));
      formData.append("deliveryTime", Number(form.deliveryTime));
      formData.append("numberOfRevisions", Number(form.numberOfRevisions));
      features.forEach((f) => formData.append("features", f));
      if (coverImage) {
        formData.append("coverImage", coverImage);
      }
      images.forEach((img) => {
        formData.append("images", img);
      });

      await api.post("/listings", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setShowSuccessPopup(true);
      setTimeout(() => {
        setShowSuccessPopup(false);
        navigate("/mygigs");
      }, 1500);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || err.message || "Failed to create service"
      );
    }
    setLoading(false);
  };

  return (
    <div className="add">
      <div className="container">
        <h1>Add New Service</h1>
        <form onSubmit={handleSubmit}>
          <div className="sections">
            <div className="info">
              {errorMsg && (
                <div
                  style={{
                    color: "#c0392b",
                    background: "#ffeaea",
                    border: "1px solid #f5c6cb",
                    padding: "10px",
                    borderRadius: "6px",
                    marginBottom: "10px",
                  }}
                >
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div
                  style={{
                    color: "#27ae60",
                    background: "#eafaf1",
                    border: "1px solid #b7e0c7",
                    padding: "10px",
                    borderRadius: "6px",
                    marginBottom: "10px",
                  }}
                >
                  {successMsg}
                </div>
              )}
              <label>Title</label>
              <input
                name="title"
                type="text"
                placeholder="e.g. I will do something I'm really good at"
                value={form.title}
                onChange={handleChange}
                required
              />
              <label>Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              >
                {allowedCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <label>Cover Image</label>
              <input type="file" accept="image/*" onChange={handleCoverImage} />
              <label>Upload Images</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImages}
              />
              <label>Description</label>
              <textarea
                name="description"
                placeholder="Brief descriptions to introduce your service to customers"
                cols="0"
                rows="16"
                value={form.description}
                onChange={handleChange}
                required
              ></textarea>
              <button
                type="submit"
                disabled={loading}
                className={loading ? "add-btn-disabled" : ""}
                style={{
                  background: loading ? "#ccc" : undefined,
                  color: loading ? "#888" : undefined,
                  cursor: loading ? "not-allowed" : undefined,
                }}
              >
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
            <div className="details">
              <label>Delivery Time (e.g. 3 days)</label>
              <input
                name="deliveryTime"
                type="number"
                min={1}
                value={form.deliveryTime}
                onChange={handleChange}
                required
              />
              <label>Revision Number</label>
              <input
                name="numberOfRevisions"
                type="number"
                min={-1}
                value={form.numberOfRevisions}
                onChange={handleChange}
                required
              />
              <label>Add Features</label>
              <div className="features-input-row">
                <input
                  type="text"
                  placeholder="e.g. customized colours"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="add-feature-btn"
                  disabled={!featureInput.trim() || loading}
                  title="Add feature"
                >
                  +
                </button>
              </div>
              <div className="features-list">
                {features.map((f, idx) => (
                  <span className="feature-chip" key={idx}>
                    {f}
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      className="remove-feature-btn"
                      title="Remove"
                      disabled={loading}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <label>Price</label>
              <input
                name="price"
                type="number"
                min={1}
                value={form.price}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>
        </form>
        {showSuccessPopup && (
          <div
            style={{
              position: "fixed",
              top: "30%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "#eafaf1",
              color: "#27ae60",
              border: "1px solid #b7e0c7",
              borderRadius: "8px",
              padding: "32px 48px",
              fontSize: "1.3rem",
              fontWeight: 600,
              zIndex: 1000,
              boxShadow: "0 4px 24px #0001",
            }}
          >
            Service created successfully!
          </div>
        )}
      </div>
    </div>
  );
};

export default Add;
