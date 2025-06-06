import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import "./Orders.scss";
import { useNavigate } from "react-router-dom";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [updateError, setUpdateError] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewOrderId, setReviewOrderId] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const navigate = useNavigate();
  // Get current user from localStorage
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError("");
      try {
        let res;
        if (currentUser?.roles?.includes("artisan")) {
          res = await api.get("/orders/provider");
        } else {
          res = await api.get("/orders/my");
        }
        setOrders(res.data || []);
      } catch (err) {
        setError(
          err.response?.data?.message || err.message || "Failed to load orders"
        );
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  // Determine column label
  let partyLabel = "";
  if (currentUser?.roles?.includes("artisan")) {
    partyLabel = "Buyer";
  } else if (currentUser?.roles?.includes("user")) {
    partyLabel = "Seller";
  } else {
    partyLabel = "Party";
  }

  // Handler for updating order status (artisan only)
  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    setUpdateError("");
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      setUpdateError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update order status"
      );
    }
    setUpdatingOrderId(null);
  };

  // All possible statuses
  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  // Handler for opening review modal
  const openReviewModal = (orderId) => {
    setReviewOrderId(orderId);
    setReviewRating(0);
    setReviewComment("");
    setReviewError("");
    setReviewSuccess("");
    setShowReviewModal(true);
  };

  // Handler for submitting review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewSubmitting(true);
    setReviewError("");
    setReviewSuccess("");
    try {
      await api.post("/reviews", {
        order: reviewOrderId,
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewSuccess("Review submitted!");
      setTimeout(() => {
        setShowReviewModal(false);
        setReviewSuccess("");
        // Optionally, you can refresh orders here if needed
        // fetchOrders();
      }, 1200);
    } catch (err) {
      setReviewError(
        err.response?.data?.message || err.message || "Failed to submit review"
      );
    }
    setReviewSubmitting(false);
  };

  // Star rating component
  const StarRating = ({ rating, setRating }) => (
    <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{
            cursor: "pointer",
            color: star <= rating ? "#f1c40f" : "#ccc",
            fontSize: 24,
          }}
          onClick={() => setRating(star)}
          data-testid={`star-${star}`}
        >
          ★
        </span>
      ))}
    </div>
  );

  return (
    <div className="orders">
      <div className="container">
        <div className="title">
          <h1>Orders</h1>
        </div>
        {error && (
          <div style={{ color: "#c0392b", marginBottom: 12 }}>{error}</div>
        )}
        {updateError && (
          <div style={{ color: "#c0392b", marginBottom: 12 }}>
            {updateError}
          </div>
        )}
        {reviewError && (
          <div style={{ color: "#c0392b", marginBottom: 12 }}>
            {reviewError}
          </div>
        )}
        {reviewSuccess && (
          <div style={{ color: "#27ae60", marginBottom: 12 }}>
            {reviewSuccess}
          </div>
        )}
        {/* Review Modal */}
        {showReviewModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              animation: "fadeInBg 0.2s",
            }}
            onClick={() => setShowReviewModal(false)}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #fff 80%, #f3eaea 100%)",
                padding: 32,
                borderRadius: 14,
                minWidth: 340,
                maxWidth: 400,
                width: "100%",
                boxShadow: "0 8px 32px rgba(44, 62, 80, 0.18)",
                position: "relative",
                border: "1.5px solid #e7dede",
                animation: "popupIn 0.25s",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowReviewModal(false)}
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  background: "transparent",
                  border: "none",
                  fontSize: 22,
                  color: "#b2b2b2",
                  cursor: "pointer",
                  transition: "color 0.15s",
                }}
                aria-label="Close"
                tabIndex={0}
                onMouseOver={(e) => (e.currentTarget.style.color = "#7c3a3a")}
                onMouseOut={(e) => (e.currentTarget.style.color = "#b2b2b2")}
              >
                ×
              </button>
              <h3
                style={{
                  marginTop: 0,
                  marginBottom: 18,
                  color: "#7c3a3a",
                  letterSpacing: 0.5,
                }}
              >
                Leave a Review
              </h3>
              {reviewSuccess ? (
                <div
                  style={{
                    color: "#27ae60",
                    marginBottom: 12,
                    fontWeight: 600,
                    textAlign: "center",
                    fontSize: 16,
                  }}
                >
                  {reviewSuccess}
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit}>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontWeight: 500, color: "#7c3a3a" }}>
                      Order ID:
                      <input
                        type="text"
                        value={reviewOrderId}
                        disabled
                        style={{
                          width: "100%",
                          marginTop: 4,
                          marginBottom: 8,
                          padding: 8,
                          borderRadius: 6,
                          border: "1.2px solid #e7dede",
                          background: "#f9f6f6",
                          color: "#7c3a3a",
                          fontWeight: 500,
                          fontSize: 14,
                          letterSpacing: 0.2,
                        }}
                      />
                    </label>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontWeight: 500, color: "#7c3a3a" }}>
                      Rating:
                    </label>
                    <StarRating
                      rating={reviewRating}
                      setRating={setReviewRating}
                    />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontWeight: 500, color: "#7c3a3a" }}>
                      Comment:
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        rows={3}
                        style={{
                          width: "100%",
                          marginTop: 4,
                          padding: 8,
                          borderRadius: 6,
                          border: "1.2px solid #e7dede",
                          background: "#f9f6f6",
                          color: "#7c3a3a",
                          fontSize: 14,
                          resize: "vertical",
                        }}
                        required
                        disabled={reviewSubmitting}
                      />
                    </label>
                  </div>
                  {reviewError && (
                    <div
                      style={{
                        color: "#c0392b",
                        background: "#ffeaea",
                        border: "1px solid #c0392b",
                        borderRadius: 4,
                        padding: "8px 12px",
                        marginBottom: 14,
                        fontWeight: 500,
                        fontSize: 14,
                        textAlign: "center",
                      }}
                    >
                      {reviewError}
                    </div>
                  )}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 10,
                      marginTop: 8,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setShowReviewModal(false)}
                      style={{
                        background: "#eee",
                        color: "#7c3a3a",
                        border: "none",
                        borderRadius: 5,
                        padding: "7px 18px",
                        cursor: "pointer",
                        fontWeight: 500,
                        fontSize: 14,
                        transition: "background 0.15s",
                      }}
                      disabled={reviewSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={reviewSubmitting || reviewRating === 0}
                      style={{
                        background: "#7c3a3a",
                        color: "#fff",
                        border: "none",
                        borderRadius: 5,
                        padding: "7px 18px",
                        cursor:
                          reviewRating === 0 || reviewSubmitting
                            ? "not-allowed"
                            : "pointer",
                        opacity:
                          reviewRating === 0 || reviewSubmitting ? 0.7 : 1,
                        fontWeight: 600,
                        fontSize: 14,
                        boxShadow: "0 2px 8px rgba(124,58,58,0.07)",
                        transition: "background 0.15s",
                      }}
                    >
                      {reviewSubmitting ? "Submitting..." : "Submit"}
                    </button>
                  </div>
                </form>
              )}
            </div>
            {/* Add popup animation keyframes */}
            <style>
              {`
                @keyframes popupIn {
                  from { transform: scale(0.95) translateY(20px); opacity: 0; }
                  to { transform: scale(1) translateY(0); opacity: 1; }
                }
                @keyframes fadeInBg {
                  from { opacity: 0; }
                  to { opacity: 1; }
                }
              `}
            </style>
          </div>
        )}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Price</th>
                <th>Booked Date</th>
                <th>Payment Status</th>
                <th>Order Status</th>
                <th>{partyLabel}</th>
                <th>Contact</th>
                {/* Only show Review column if not artisan */}
                {!currentUser?.roles?.includes("artisan") && <th>Review</th>}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>
                    <span style={{ marginRight: 8 }}>{order._id}</span>
                    <button
                      style={{
                        background: "#f3eaea",
                        color: "#7c3a3a",
                        border: "none",
                        borderRadius: "4px",
                        padding: "4px 12px",
                        cursor: "pointer",
                        fontWeight: 500,
                        fontSize: "13px",
                      }}
                      onClick={() => navigate(`/gig/${order.listingId}`)}
                    >
                      View
                    </button>
                  </td>
                  <td>{order.price}</td>
                  <td>
                    {order.bookingDate
                      ? new Date(order.bookingDate).toLocaleString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "N/A"}
                  </td>
                  <td>
                    <span
                      className={
                        "payment-status " +
                        (order.paymentStatus === "paid"
                          ? "paid"
                          : order.paymentStatus === "pending"
                          ? "pending"
                          : order.paymentStatus === "failed"
                          ? "failed"
                          : order.paymentStatus === "refunded"
                          ? "refunded"
                          : "unknown")
                      }
                    >
                      {order.paymentStatus
                        ? order.paymentStatus.charAt(0).toUpperCase() +
                          order.paymentStatus.slice(1)
                        : "N/A"}
                    </span>
                  </td>
                  <td>
                    {currentUser?.roles?.includes("artisan") ? (
                      <select
                        className={
                          "order-status order-status-select " +
                          (order.status === "confirmed"
                            ? "confirmed"
                            : order.status === "pending"
                            ? "pending"
                            : order.status === "in_progress"
                            ? "in-progress"
                            : order.status === "completed"
                            ? "completed"
                            : order.status === "cancelled"
                            ? "cancelled"
                            : "unknown")
                        }
                        value={order.status}
                        disabled={updatingOrderId === order._id}
                        onChange={(e) =>
                          handleStatusChange(order._id, e.target.value)
                        }
                      >
                        {statusOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span
                        className={
                          "order-status " +
                          (order.status === "confirmed"
                            ? "confirmed"
                            : order.status === "pending"
                            ? "pending"
                            : order.status === "in_progress"
                            ? "in-progress"
                            : order.status === "completed"
                            ? "completed"
                            : order.status === "cancelled"
                            ? "cancelled"
                            : "unknown")
                        }
                      >
                        {order.status
                          ? order.status
                              .replace(/_/g, " ")
                              .replace(/^\w/, (c) => c.toUpperCase())
                          : "N/A"}
                      </span>
                    )}
                  </td>
                  <td>
                    {currentUser?.roles?.includes("artisan")
                      ? order.customer?.name
                      : order.provider?.name}
                  </td>
                  <td>
                    <img className="message" src="./img/message.png" alt="" />
                  </td>
                  {/* Only show Review cell if not artisan */}
                  {!currentUser?.roles?.includes("artisan") && (
                    <td>
                      {currentUser?.roles?.includes("user") &&
                        order.status === "completed" && (
                          <button
                            style={{
                              background: "#f3eaea",
                              color: "#7c3a3a",
                              border: "none",
                              borderRadius: "4px",
                              padding: "4px 12px",
                              cursor: "pointer",
                              fontWeight: 500,
                              fontSize: "13px",
                            }}
                            onClick={() => openReviewModal(order._id)}
                          >
                            Leave Review
                          </button>
                        )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Orders;
