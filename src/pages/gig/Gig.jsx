import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import "./Gig.scss";
// Remove the Slider import
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

  // Add state for reviews
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState("");
  // Add state for review deletion
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  const [deleteReviewError, setDeleteReviewError] = useState("");

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
      <div className="order-popup-overlay">
        <div className="order-popup-content">
          <h2 className="order-popup-title">Place Order?</h2>
          <div className="order-popup-listingid">
            <b>Listing ID:</b>{" "}
            <span className="order-popup-listingid-value">{data._id}</span>
          </div>
          <div className="order-popup-date">
            <label className="order-popup-label">
              Booking Date:
              <input
                type="datetime-local"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="order-popup-input"
                disabled={orderLoading}
              />
            </label>
          </div>
          <div className="order-popup-note">
            <label className="order-popup-label">
              Note:
              <textarea
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                rows={2}
                placeholder="Leave a note for the provider (optional)"
                className="order-popup-textarea"
                disabled={orderLoading}
              />
            </label>
          </div>
          <div className="order-popup-actions">
            <button
              onClick={handlePlaceOrder}
              disabled={orderLoading || !orderDate}
              className="order-popup-btn order-popup-btn-yes"
            >
              {orderLoading ? "Placing..." : "Yes, Place Order"}
            </button>
            <button
              onClick={() => setShowOrderPopup(false)}
              disabled={orderLoading}
              className="order-popup-btn order-popup-btn-no"
            >
              No, Cancel
            </button>
          </div>
          {orderError && <div className="order-popup-error">{orderError}</div>}
          {orderSuccess && (
            <div className="order-popup-success">{orderSuccess}</div>
          )}
        </div>
      </div>,
      document.body
    );
  };

  // Add state for the custom slider
  const [currentSlide, setCurrentSlide] = useState(0);

  // Navigation functions for the slider
  const nextSlide = () => {
    if (!data?.images?.length) return;
    setCurrentSlide((prev) => (prev === data.images.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    if (!data?.images?.length) return;
    setCurrentSlide((prev) => (prev === 0 ? data.images.length - 1 : prev - 1));
  };

  // Fetch reviews for this listing
  useEffect(() => {
    setReviews([]);
    setReviewsLoading(true);
    setReviewsError("");
    api
      .get(`/reviews/listing/${id}`)
      .then((res) => setReviews(res.data || []))
      .catch((err) =>
        setReviewsError(
          err.response?.data?.message || err.message || "Failed to load reviews"
        )
      )
      .finally(() => setReviewsLoading(false));
  }, [id]);

  // Handler for deleting a review
  const handleDeleteReview = async (reviewId) => {
    setDeletingReviewId(reviewId);
    setDeleteReviewError("");
    try {
      await api.delete(`/reviews/${reviewId}`);
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
    } catch (err) {
      setDeleteReviewError(
        err.response?.data?.message || err.message || "Failed to delete review"
      );
    }
    setDeletingReviewId(null);
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
                <div className="stars seller-stars">
                  {Array(5)
                    .fill()
                    .map((_, index) => (
                      <span
                        key={index}
                        className={`star ${
                          index < data.rating ? "filled" : "empty"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  <span className="stars-value">{data.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            {/* Replace Slider with custom implementation */}
            <div className="simple-slider">
              {data.images && data.images.length > 0 ? (
                <>
                  <img
                    src={data.images[currentSlide]}
                    alt={`Slide ${currentSlide + 1}`}
                    className="slider-image"
                  />

                  {data.images.length > 1 && (
                    <>
                      {/* Move buttons outside slider-controls for vertical centering */}
                      <button
                        onClick={prevSlide}
                        className="slider-btn prev-btn"
                      >
                        &lt;
                      </button>

                      <button
                        onClick={nextSlide}
                        className="slider-btn next-btn"
                      >
                        &gt;
                      </button>

                      {/* Keep dots at the bottom */}
                      <div className="slider-dots">
                        {data.images.map((_, index) => (
                          <span
                            key={index}
                            className={`slider-dot ${
                              currentSlide === index ? "active" : ""
                            }`}
                            onClick={() => setCurrentSlide(index)}
                          ></span>
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <img
                  src={data.coverImage}
                  alt="Cover"
                  className="slider-image"
                />
              )}
            </div>
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
                    <div className="stars seller-stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`star${
                            star <= data.rating ? " filled" : ""
                          }`}
                        >
                          ★
                        </span>
                      ))}
                      <span className="stars-value">
                        {data.rating.toFixed(1)}
                      </span>
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
            {/* --- REVIEWS SECTION --- */}
            <div style={{ marginTop: 32 }}>
              <h3 style={{ marginBottom: 12 }}>Reviews</h3>
              {deleteReviewError && (
                <div style={{ color: "#c0392b", marginBottom: 10 }}>
                  {deleteReviewError}
                </div>
              )}
              {reviewsLoading ? (
                <div>Loading reviews...</div>
              ) : reviewsError ? (
                <div style={{ color: "#c0392b" }}>{reviewsError}</div>
              ) : reviews.length === 0 ? (
                <div style={{ color: "#888" }}>No reviews yet.</div>
              ) : (
                <div className="reviews-list">
                  {reviews.map((review) => (
                    <div
                      key={review._id}
                      className="review-item"
                      style={{
                        display: "flex",
                        gap: 14,
                        marginBottom: 18,
                        background: "#faf9f8",
                        borderRadius: 8,
                        padding: "14px 16px",
                        boxShadow: "0 1px 4px #eee",
                        alignItems: "flex-start",
                      }}
                    >
                      <img
                        src={
                          review.reviewerDetails?.profilePicture ||
                          "/img/noavatar.jpg"
                        }
                        alt={review.reviewerDetails?.name || "Reviewer"}
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: "50%",
                          objectFit: "cover",
                          marginRight: 8,
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>
                          {review.reviewerDetails?.name || "Anonymous"}
                          <span
                            style={{
                              color: "#888",
                              fontWeight: 400,
                              fontSize: 13,
                              marginLeft: 8,
                            }}
                          >
                            {review.reviewerDetails?.country
                              ? `(${review.reviewerDetails.country})`
                              : ""}
                          </span>
                          {/* Show delete button only if signed-in user is the reviewer */}
                          {currentUser &&
                            review.reviewer &&
                            review.reviewer === currentUser._id && (
                              <button
                                style={{
                                  marginLeft: 12,
                                  background: "#ffeaea",
                                  color: "#c0392b",
                                  border: "1px solid #c0392b",
                                  borderRadius: 4,
                                  padding: "2px 10px",
                                  fontSize: 13,
                                  fontWeight: 500,
                                  cursor:
                                    deletingReviewId === review._id
                                      ? "not-allowed"
                                      : "pointer",
                                  opacity:
                                    deletingReviewId === review._id ? 0.7 : 1,
                                }}
                                disabled={deletingReviewId === review._id}
                                onClick={() => handleDeleteReview(review._id)}
                                title="Delete your review"
                              >
                                {deletingReviewId === review._id
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                            )}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            margin: "4px 0 8px 0",
                          }}
                        >
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              style={{
                                color:
                                  star <= review.rating ? "#f1c40f" : "#ccc",
                                fontSize: 16,
                                marginRight: 2,
                              }}
                            >
                              ★
                            </span>
                          ))}
                          <span
                            style={{
                              color: "#555",
                              fontSize: 13,
                              marginLeft: 6,
                            }}
                          >
                            {review.rating}/5
                          </span>
                          <span
                            style={{
                              color: "#aaa",
                              fontSize: 12,
                              marginLeft: 10,
                            }}
                          >
                            {review.createdAt
                              ? new Date(review.createdAt).toLocaleDateString()
                              : ""}
                          </span>
                        </div>
                        <div style={{ fontSize: 15 }}>{review.comment}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* --- END REVIEWS SECTION --- */}
          </div>
        </div>
      )}
    </div>
  );
}

export default Gig;
