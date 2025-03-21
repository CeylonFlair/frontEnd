// import { useState } from 'react'
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import SignIn from './SignIn.jsx';
import Register from './SignUp.jsx';

function App() {
  return (
    <>
      {/* <SignIn />
      <Register /> */}
      <Router>
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/login" element={<SignIn />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Router>
    </>
  )
}

export default App;
