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
  // Add state for delete confirmation popup
  const [confirmDeleteReviewId, setConfirmDeleteReviewId] = useState(null);

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

  // Handler for confirming delete
  const handleConfirmDelete = (reviewId) => {
    setConfirmDeleteReviewId(reviewId);
  };

  // Handler for canceling delete
  const handleCancelDelete = () => {
    setConfirmDeleteReviewId(null);
  };

  // Handler for actually deleting after confirmation
  const handleDeleteReviewConfirmed = async () => {
    if (!confirmDeleteReviewId) return;
    setDeletingReviewId(confirmDeleteReviewId);
    setDeleteReviewError("");
    try {
      await api.delete(`/reviews/${confirmDeleteReviewId}`);
      setReviews((prev) => prev.filter((r) => r._id !== confirmDeleteReviewId));
    } catch (err) {
      setDeleteReviewError(
        err.response?.data?.message || err.message || "Failed to delete review"
      );
    }
    setDeletingReviewId(null);
    setConfirmDeleteReviewId(null);
  };

  // Render confirmation popup for review deletion
  const renderDeleteConfirmPopup = () => {
    if (!confirmDeleteReviewId) return null;
    return ReactDOM.createPortal(
      <div className="delete-review-popup-overlay">
        <div className="delete-review-popup-content">
          <h3>Delete Review?</h3>
          <p>
            Are you sure you want to delete your review? This action cannot be
            undone.
          </p>
          <div className="delete-review-popup-actions">
            <button
              className="delete-review-popup-btn delete"
              onClick={handleDeleteReviewConfirmed}
              disabled={deletingReviewId === confirmDeleteReviewId}
            >
              {deletingReviewId === confirmDeleteReviewId
                ? "Deleting..."
                : "Yes, Delete"}
            </button>
            <button
              className="delete-review-popup-btn cancel"
              onClick={handleCancelDelete}
              disabled={deletingReviewId === confirmDeleteReviewId}
            >
              Cancel
            </button>
          </div>
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
                className={`gig-edit-details-btn${
                  editLoading ? " loading" : ""
                }`}
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
                  <span className="seller-email">{data.provider?.email}</span>
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
                className="gig-continue-btn"
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
                <div className="review-delete-error">{deleteReviewError}</div>
              )}
              {reviewsLoading ? (
                <div>Loading reviews...</div>
              ) : reviewsError ? (
                <div className="review-error">{reviewsError}</div>
              ) : reviews.length === 0 ? (
                <div className="review-empty">No reviews yet.</div>
              ) : (
                <div className="reviews-list">
                  {reviews.map((review) => (
                    <div key={review._id} className="review-item">
                      <img
                        src={
                          review.reviewerDetails?.profilePicture ||
                          "/img/noavatar.jpg"
                        }
                        alt={review.reviewerDetails?.name || "Reviewer"}
                        className="reviewer-img"
                      />
                      <div className="review-content">
                        <div className="review-header">
                          {review.reviewerDetails?.name || "Anonymous"}
                          <span className="review-country">
                            {review.reviewerDetails?.country
                              ? `(${review.reviewerDetails.country})`
                              : ""}
                          </span>
                          {/* Show delete icon button only if signed-in user is the reviewer */}
                          {currentUser &&
                            review.reviewer &&
                            review.reviewer === currentUser._id && (
                              <button
                                className={`review-delete-btn icon-btn${
                                  deletingReviewId === review._id
                                    ? " loading"
                                    : ""
                                }`}
                                disabled={deletingReviewId === review._id}
                                onClick={() => handleConfirmDelete(review._id)}
                                title="Delete your review"
                                aria-label="Delete review"
                              >
                                {/* Garbage can SVG icon, white color */}
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 20 20"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  style={{ display: "block" }}
                                >
                                  <path
                                    d="M6.5 8V14M10 8V14M13.5 8V14M3 5.5H17M8.5 3.5H11.5C12.0523 3.5 12.5 3.94772 12.5 4.5V5.5H7.5V4.5C7.5 3.94772 7.94772 3.5 8.5 3.5ZM16 5.5V16.5C16 17.0523 15.5523 17.5 15 17.5H5C4.44772 17.5 4 17.0523 4 16.5V5.5"
                                    stroke="#fff"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                                {deletingReviewId === review._id && (
                                  <span className="visually-hidden">
                                    Deleting...
                                  </span>
                                )}
                              </button>
                            )}
                        </div>
                        <div className="review-stars-row">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`review-star${
                                star <= review.rating ? " filled" : ""
                              }`}
                            >
                              ★
                            </span>
                          ))}
                          <span className="review-rating">
                            {review.rating}/5
                          </span>
                          <span className="review-date">
                            {review.createdAt
                              ? new Date(review.createdAt).toLocaleDateString()
                              : ""}
                          </span>
                        </div>
                        <div className="review-comment">{review.comment}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Render the delete confirmation popup */}
              {renderDeleteConfirmPopup()}
            </div>
            {/* --- END REVIEWS SECTION --- */}
          </div>
        </div>
      )}
    </div>
  );
}

export default Gig;
