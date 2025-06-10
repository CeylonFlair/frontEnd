import React from "react";
import "./Cancel.scss";
import { useParams, useNavigate } from "react-router-dom";

const Cancel = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="success payment-container">
      <h2>Payment Cancelled</h2>
      <p>
        Your payment was cancelled. Please try again if you wish to complete
        your purchase.
      </p>
      <button className="back-button" onClick={() => navigate(`/pay/${id}`)}>
        Try Again
      </button>
    </div>
  );
};

export default Cancel;
