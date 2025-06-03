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
