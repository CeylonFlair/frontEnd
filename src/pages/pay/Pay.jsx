import React, { useState, useEffect } from "react";
import "./Pay.scss";
import { useParams } from "react-router-dom";
import api from "../../utils/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Pay = () => {
  const { id: orderIdParam } = useParams();
  const [orderDetails, setOrderDetails] = useState({
    order_id: "",
    amount: "",
    customer_name: "",
    currency: "LKR",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingOrder, setFetchingOrder] = useState(true);

  // Fetch order details from /orders/:id and pre-fill
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderIdParam) return;
      setFetchingOrder(true);
      try {
        const res = await api.get(`/orders/${orderIdParam}`);
        const order = res.data;
        setOrderDetails({
          order_id: order._id,
          amount: order.price,
          customer_name: order.customer?.name || "",
          currency: "LKR",
        });
      } catch (err) {
        setError("Failed to fetch order details.");
      }
      setFetchingOrder(false);
    };
    fetchOrder();
  }, [orderIdParam]);

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (
      !orderDetails.order_id ||
      !orderDetails.amount ||
      !orderDetails.customer_name
    ) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/payments/initiate", {
        orderId: orderDetails.order_id,
      });

      // Use the 'data' property from the response as the PayHere payload
      const { data } = response.data;

      // Remove any existing payhere script to avoid duplicates
      const existingScript = document.querySelector(
        'script[src="https://www.payhere.lk/lib/payhere.js"]'
      );
      if (existingScript) {
        existingScript.remove();
      }

      // Ensure window.payhere is undefined before loading
      if (window.payhere) {
        delete window.payhere;
      }

      // Load PayHere SDK
      const script = document.createElement("script");
      script.src = "https://www.payhere.lk/lib/payhere.js";
      script.async = true;
      script.onload = () => {
        // Defensive: check window.payhere and data
        if (
          window.payhere &&
          typeof window.payhere.startPayment === "function" &&
          data &&
          typeof data === "object"
        ) {
          window.payhere.onCompleted = (paymentId) => {
            window.location.href = "/pay/success";
          };
          window.payhere.onDismissed = () => {
            window.location.href = `/pay/${orderIdParam}/cancel`;
          };
          window.payhere.onError = (errorMsg) => {
            setError("Payment failed. Please try again.");
            setLoading(false);
            // Navigate to cancel page with order id
            window.location.href = `/pay/${orderIdParam}/cancel`;
          };
          window.payhere.startPayment(data); // send the 'data' object from backend
        } else {
          setError(
            "Payment could not be started. Please refresh and try again."
          );
          setLoading(false);
        }
      };
      script.onerror = () => {
        setError("Failed to load payment gateway. Please try again.");
        setLoading(false);
      };
      document.body.appendChild(script);
    } catch (error) {
      setError("Failed to initiate payment. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="pay">
      <div className="payment-container">
        <h2>Pay for CeylonFlair Products</h2>
        {error && <p className="error">{error}</p>}
        {fetchingOrder ? (
          <div style={{ textAlign: "center", margin: "32px 0" }}>
            <span
              className="loader"
              style={{
                display: "inline-block",
                width: 32,
                height: 32,
                border: "4px solid #eee",
                borderTop: "4px solid #1dbf73",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
            <style>
              {`@keyframes spin { 100% { transform: rotate(360deg); } }`}
            </style>
            <div style={{ marginTop: 12, color: "#888" }}>
              Loading order details...
            </div>
          </div>
        ) : (
          <form className="payment-form" onSubmit={handlePayment}>
            <div className="form-group">
              <label htmlFor="order_id">Order ID</label>
              <input
                type="text"
                id="order_id"
                name="order_id"
                value={orderDetails.order_id}
                readOnly
                disabled
                placeholder="ORD12345"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="amount">Amount</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={orderDetails.amount}
                readOnly
                disabled
                placeholder="100"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="customer_name">Full Name</label>
              <input
                type="text"
                id="customer_name"
                name="customer_name"
                value={orderDetails.customer_name}
                readOnly
                disabled
                placeholder="Test User"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="currency">Currency</label>
              <input
                type="text"
                id="currency"
                name="currency"
                value={orderDetails.currency}
                disabled
                readOnly
                style={{ background: "#f5f5f5", color: "#888" }}
              />
            </div>
            <button type="submit" className="pay-button" disabled={loading}>
              {loading ? "Processing..." : "Pay with PayHere"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Pay;
