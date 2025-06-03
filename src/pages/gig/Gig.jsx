import React, { useState, useRef } from "react";
import ReactDOM from "react-dom";
import "./Gig.scss";
import { Slider } from "infinite-react-carousel/lib";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../utils/api";

function Gig() {
  const { id } = useParams();
  const navigate = useNavigate();
  // Get current user from localStorage (assume user object is stored as JSON)
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ["gig", id],
    queryFn: () => api.get(`/listings/${id}`).then((res) => res.data),
  });

  // State for editing
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  // For image editing
  const [editImages, setEditImages] = useState([]);
  const [editRemoveImages, setEditRemoveImages] = useState([]);
  const [editCoverImage, setEditCoverImage] = useState(null);
  const [editCoverPreview, setEditCoverPreview] = useState(null);
  const imagesInputRef = useRef();
  const coverInputRef = useRef();

  // Popup state for order confirmation
  const [showOrderPopup, setShowOrderPopup] = useState(false);
  const [orderDate, setOrderDate] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState("");

  // Helper: is current user the provider and artisan
  const isProviderArtisan =
    currentUser &&
    data &&
    data.providerId === currentUser._id &&
    currentUser.roles?.includes("artisan");

  console.log("current user role :", currentUser?.roles);
  console.log("data provider id :", data?.providerId);
  console.log("current user id :", currentUser?._id);

  // Start editing
  const handleEditClick = () => {
    setEditForm({
      title: data.title,
      description: data.description,
      price: data.price,
      deliveryTime: data.deliveryTime,
      numberOfRevisions: data.numberOfRevisions,
      features: data.features ? [...data.features] : [],
    });
    setEditImages([]);
    setEditRemoveImages([]);
    setEditCoverImage(null);
    setEditCoverPreview(null);
    setEditMode(true);
    setEditError("");
    setEditSuccess("");
  };

  // Cancel editing
  const handleEditCancel = () => {
    setEditMode(false);
    setEditForm(null);
    setEditError("");
    setEditSuccess("");
  };

  // Handle edit form changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]:
        name === "price" ||
        name === "deliveryTime" ||
        name === "numberOfRevisions"
          ? Number(value)
          : value,
    }));
  };

  // Handle features edit
  const handleFeatureChange = (idx, value) => {
    setEditForm((prev) => {
      const features = [...prev.features];
      features[idx] = value;
      return { ...prev, features };
    });
  };
  const handleFeatureAdd = () => {
    setEditForm((prev) => ({
      ...prev,
      features: [...(prev.features || []), ""],
    }));
  };
  const handleFeatureRemove = (idx) => {
    setEditForm((prev) => {
      const features = [...prev.features];
      features.splice(idx, 1);
      return { ...prev, features };
    });
  };

  // Handle new images selection
  const handleImagesChange = (e) => {
    setEditImages(Array.from(e.target.files));
  };

  // Handle cover image selection
  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    setEditCoverImage(file);
    setEditCoverPreview(file ? URL.createObjectURL(file) : null);
  };

  // Remove image from existing images
  const handleRemoveImage = (url) => {
    setEditRemoveImages((prev) => (prev.includes(url) ? prev : [...prev, url]));
  };

  // Undo remove image
  const handleUndoRemoveImage = (url) => {
    setEditRemoveImages((prev) => prev.filter((img) => img !== url));
  };

  // Save edited gig (with images)
  const handleEditSave = async () => {
    setEditLoading(true);
    setEditError("");
    setEditSuccess("");
    try {
      const formData = new FormData();
      // Text fields
      Object.entries(editForm).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v) => formData.append(key, v));
        } else {
          formData.append(key, value);
        }
      });
      // Images to remove
      if (editRemoveImages.length > 0) {
        formData.append("removeImages", JSON.stringify(editRemoveImages));
      }
      // New images
      editImages.forEach((file) => formData.append("images", file));
      // New cover image
      if (editCoverImage) {
        formData.append("coverImage", editCoverImage);
      }
      await api.put(`/listings/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setEditSuccess("Gig updated successfully!");
      setEditMode(false);
      setEditForm(null);
      setEditImages([]);
      setEditRemoveImages([]);
      setEditCoverImage(null);
      setEditCoverPreview(null);
      refetch();
    } catch (err) {
      setEditError(
        err.response?.data?.message || err.message || "Failed to update gig"
      );
    }
    setEditLoading(false);
  };

  // Handler for placing order
  const handlePlaceOrder = async () => {
    setOrderLoading(true);
    setOrderError("");
    setOrderSuccess("");
    try {
      const res = await api.post("/orders", {
        listingId: data._id,
        bookingDate: orderDate,
        notes: orderNote,
      });
      setOrderSuccess("Order created successfully!");
      setTimeout(() => {
        setShowOrderPopup(false);
        navigate(`/pay/${res.data.orderID}`);
      }, 1200);
    } catch (err) {
      setOrderError(
        err.response?.data?.message || err.message || "Failed to create order"
      );
    }
    setOrderLoading(false);
  };

  // Render the order popup using a portal
  const renderOrderPopup = () => {
    if (!showOrderPopup) return null;

    return ReactDOM.createPortal(
      <div
        className="order-popup-overlay"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}
      >
        <div
          className="order-popup-content"
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: "32px 32px 24px 32px",
            minWidth: 340,
            boxShadow: "0 8px 48px rgba(0, 0, 0, 0.3)",
            position: "relative",
            maxWidth: "95vw",
          }}
        >
          <h2 style={{ marginBottom: 18, color: "#7c3a3a" }}>Place Order?</h2>
          <div style={{ marginBottom: 12, fontSize: 15 }}>
            <b>Listing ID:</b> <span style={{ color: "#888" }}>{data._id}</span>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontWeight: 500, color: "#555" }}>
              Booking Date:
              <input
                type="datetime-local"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                style={{
                  marginLeft: 8,
                  padding: "6px 12px",
                  border: "1px solid #ccc",
                  borderRadius: 6,
                  fontSize: 15,
                }}
                disabled={orderLoading}
              />
            </label>
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 500, color: "#555" }}>
              Note:
              <textarea
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                rows={2}
                placeholder="Leave a note for the provider (optional)"
                style={{
                  width: "100%",
                  marginTop: 6,
                  padding: "8px 12px",
                  border: "1px solid #ccc",
                  borderRadius: 6,
                  fontSize: 15,
                  resize: "vertical",
                }}
                disabled={orderLoading}
              />
            </label>
          </div>
          <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
            <button
              onClick={handlePlaceOrder}
              disabled={orderLoading || !orderDate}
              style={{
                background: "#1dbf73",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "10px 28px",
                fontWeight: 600,
                fontSize: 16,
                cursor: orderLoading || !orderDate ? "not-allowed" : "pointer",
                opacity: orderLoading || !orderDate ? 0.7 : 1,
              }}
            >
              {orderLoading ? "Placing..." : "Yes, Place Order"}
            </button>
            <button
              onClick={() => setShowOrderPopup(false)}
              disabled={orderLoading}
              style={{
                background: "#eee",
                color: "#555",
                border: "none",
                borderRadius: 6,
                padding: "10px 28px",
                fontWeight: 600,
                fontSize: 16,
                cursor: orderLoading ? "not-allowed" : "pointer",
                opacity: orderLoading ? 0.7 : 1,
              }}
            >
              No, Cancel
            </button>
          </div>
          {orderError && (
            <div
              style={{ color: "#c0392b", marginTop: 10, textAlign: "center" }}
            >
              {orderError}
            </div>
          )}
          {orderSuccess && (
            <div
              style={{ color: "#27ae60", marginTop: 10, textAlign: "center" }}
            >
              {orderSuccess}
            </div>
          )}
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div className="gig">
      {isLoading ? (
        "Loading..."
      ) : error ? (
        "Something went wrong!"
      ) : (
        <div className="container">
          <div className="left">
            <span className="breadcrumbs">
              CeylonFlair {">"} {data.category}
            </span>
            {/* Edit Mode UI */}
            {editMode ? (
              <div className="gig-edit-form">
                <h2>Edit Gig Details</h2>
                <div className="gig-edit-fields">
                  <label>
                    Title:
                    <input
                      name="title"
                      value={editForm.title}
                      onChange={handleEditChange}
                      disabled={editLoading}
                    />
                  </label>
                  <label>
                    Description:
                    <textarea
                      name="description"
                      value={editForm.description}
                      onChange={handleEditChange}
                      rows={5}
                      disabled={editLoading}
                    />
                  </label>
                  <div className="gig-edit-row">
                    <label>
                      Price:
                      <input
                        name="price"
                        type="number"
                        min={1}
                        value={editForm.price}
                        onChange={handleEditChange}
                        disabled={editLoading}
                      />
                    </label>
                    <label>
                      Delivery Time (days):
                      <input
                        name="deliveryTime"
                        type="number"
                        min={1}
                        value={editForm.deliveryTime}
                        onChange={handleEditChange}
                        disabled={editLoading}
                      />
                    </label>
                  </div>
                  <label>
                    Number of Revisions:
                    <input
                      name="numberOfRevisions"
                      type="number"
                      min={-1}
                      value={editForm.numberOfRevisions}
                      onChange={handleEditChange}
                      disabled={editLoading}
                    />
                  </label>
                  {/* Images editing */}
                  <label>
                    Images:
                    <div className="gig-edit-images-list">
                      {data.images &&
                        data.images.map((img) => (
                          <div key={img} className="gig-edit-image-thumb">
                            <img src={img} alt="" />
                            {editRemoveImages.includes(img) ? (
                              <button
                                type="button"
                                className="gig-edit-image-undo"
                                onClick={() => handleUndoRemoveImage(img)}
                                disabled={editLoading}
                              >
                                Undo Remove
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="gig-edit-image-remove"
                                onClick={() => handleRemoveImage(img)}
                                disabled={editLoading}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        ))}
                      {editImages.length > 0 &&
                        editImages.map((file, idx) => (
                          <div key={idx} className="gig-edit-image-thumb">
                            <img src={URL.createObjectURL(file)} alt="" />
                            <span className="gig-edit-image-new">New</span>
                          </div>
                        ))}
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      ref={imagesInputRef}
                      onChange={handleImagesChange}
                      disabled={editLoading}
                      style={{ marginTop: 8 }}
                    />
                  </label>
                  {/* Cover image editing */}
                  <label>
                    Cover Image:
                    <div className="gig-edit-cover-preview">
                      {editCoverPreview ? (
                        <img src={editCoverPreview} alt="New Cover" />
                      ) : data.coverImage ? (
                        <img src={data.coverImage} alt="Current Cover" />
                      ) : null}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      ref={coverInputRef}
                      onChange={handleCoverChange}
                      disabled={editLoading}
                      style={{ marginTop: 8 }}
                    />
                  </label>
                  {/* ...features... */}
                  <label>
                    Features:
                    <div className="gig-edit-features">
                      {editForm.features.map((f, idx) => (
                        <div className="gig-edit-feature-row" key={idx}>
                          <input
                            value={f}
                            onChange={(e) =>
                              handleFeatureChange(idx, e.target.value)
                            }
                            disabled={editLoading}
                          />
                          <button
                            type="button"
                            onClick={() => handleFeatureRemove(idx)}
                            disabled={editLoading}
                            title="Remove"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="gig-edit-feature-add"
                        onClick={handleFeatureAdd}
                        disabled={editLoading}
                      >
                        + Add Feature
                      </button>
                    </div>
                  </label>
                  <div className="gig-edit-actions">
                    <button
                      type="button"
                      className="gig-edit-save"
                      onClick={handleEditSave}
                      disabled={editLoading}
                    >
                      {editLoading ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      className="gig-edit-cancel"
                      onClick={handleEditCancel}
                      disabled={editLoading}
                    >
                      Cancel
                    </button>
                  </div>
                  {/* Show error or success message */}
                  {editError && (
                    <div className="gig-edit-error">{editError}</div>
                  )}
                  {editSuccess && (
                    <div className="gig-edit-success">{editSuccess}</div>
                  )}
                </div>
              </div>
            ) : null}
            <h1>{data.title}</h1>
            <div className="user">
              <img
                className="pp"
                src={data.provider?.profilePicture || "/img/noavatar.jpg"}
                alt=""
              />
              <span>{data.provider?.name}</span>
              {/* Optionally show rating if available */}
              {typeof data.rating === "number" && (
                <div className="stars">
                  {Array(Math.round(data.rating))
                    .fill()
                    .map((_, i) => (
                      <img src="/img/star.png" alt="" key={i} />
                    ))}
                  <span>{data.rating}</span>
                </div>
              )}
            </div>
            <Slider slidesToShow={1} arrowsScroll={1} className="slider">
              {data.images && data.images.length > 0 ? (
                data.images.map((img) => <img key={img} src={img} alt="" />)
              ) : (
                <img src={data.coverImage} alt="" />
              )}
            </Slider>
            {/* Show Edit Details button only for provider/artisan and not in edit mode */}
            {isProviderArtisan && !editMode && (
              <button
                onClick={handleEditClick}
                disabled={editLoading}
                style={{
                  margin: "16px 0",
                  background: editLoading ? "#ccc" : "#bf7e7e",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  padding: "8px 18px",
                  fontWeight: 500,
                  cursor: editLoading ? "not-allowed" : "pointer",
                  opacity: editLoading ? 0.7 : 1,
                  transition: "background 0.2s, opacity 0.2s",
                }}
              >
                Edit Details
              </button>
            )}
            <h2>About This Service</h2>
            <p>{data.description}</p>
            <div className="seller">
              <h2>About The Seller</h2>
              <div className="user">
                <img
                  src={data.provider?.profilePicture || "/img/noavatar.jpg"}
                  alt=""
                />
                <div className="info">
                  <span>{data.provider?.name}</span>
                  <span style={{ fontSize: 14, color: "#888" }}>
                    {data.provider?.email}
                  </span>
                  {/* Optionally show rating */}
                  {typeof data.rating === "number" && (
                    <div className="stars">
                      {Array(Math.round(data.rating))
                        .fill()
                        .map((_, i) => (
                          <img src="/img/star.png" alt="" key={i} />
                        ))}
                      <span>{data.rating}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="box">
                <div className="items">
                  <div className="item">
                    <span className="title">Category</span>
                    <span className="desc">{data.category}</span>
                  </div>
                  <div className="item">
                    <span className="title">Created</span>
                    <span className="desc">
                      {new Date(data.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="item">
                    <span className="title">Reviews</span>
                    <span className="desc">{data.numReviews}</span>
                  </div>
                  <div className="item">
                    <span className="title">Active</span>
                    <span className="desc">{data.isActive ? "Yes" : "No"}</span>
                  </div>
                </div>
                <hr />
                {/* Optionally show more about provider */}
              </div>
            </div>
            {/* You can add reviews here if you have them */}
          </div>
          <div className="right">
            <div className="price">
              <h3>{data.title}</h3>
              <h2>Rs {data.price}</h2>
            </div>
            <p>{data.shortDesc || data.description?.slice(0, 100) + "..."}</p>
            <div className="details">
              <div className="item">
                <img src="/img/clock.png" alt="" />
                <span>{data.deliveryTime} Days Delivery</span>
              </div>
              <div className="item">
                <img src="/img/recycle.png" alt="" />
                <span>
                  {data.numberOfRevisions === -1
                    ? "Unlimited"
                    : `${data.numberOfRevisions} Revisions`}
                </span>
              </div>
            </div>
            <div className="features">
              {data.features &&
                data.features.map((feature) => (
                  <div className="item" key={feature}>
                    <img src="/img/greencheck.png" alt="" />
                    <span>{feature}</span>
                  </div>
                ))}
            </div>
            {/* Show Continue button only for users with 'user' role */}
            {currentUser?.roles?.includes("user") && (
              <button
                onClick={() => setShowOrderPopup(true)}
                style={{
                  background: "#1dbf73",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "12px 36px",
                  fontWeight: 700,
                  fontSize: 17,
                  cursor: "pointer",
                  marginTop: 12,
                }}
              >
                Continue
              </button>
            )}
            {/* Render the portal */}
            {renderOrderPopup()}
          </div>
        </div>
      )}
    </div>
  );
}

export default Gig;
