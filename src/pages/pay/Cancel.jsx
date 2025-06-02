import React from "react";
import "./Cancel.scss";

const Cancel = () => {
  return (
    <div className="success payment-container">
      <h2>Payment Cancelled</h2>
      <p>Your payment was cancelled. Please try again if you wish to complete your purchase.</p>
      <a href="/pay/:id" className="back-button">Try Again</a>
    </div>
  );
};

export default Cancel;
