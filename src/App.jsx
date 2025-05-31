// import { useState } from 'react'
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import SignIn from './SignIn.jsx';
import Register from './SignUp.jsx';
import PaymentForm from './PaymentForm.jsx';
import PaymentSuccess from './PaymentSuccess.jsx';
import PaymentCancel from './PaymentCancel.jsx';
import ReviewPage from './ReviewPage.jsx';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/login" element={<SignIn />} />
          <Route path="/register" element={<Register />} />
          <Route path="/payment" element={<PaymentForm />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/cancel" element={<PaymentCancel />} />
          <Route path="/reviews/:listingId" element={<ReviewPage />} />
        </Routes>
      </Router>
    </>
  )
}

export default App;

