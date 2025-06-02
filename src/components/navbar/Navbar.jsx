import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import api from "../../utils/api";
import "./Navbar.scss";

function Navbar() {
  const [active, setActive] = useState(false);
  const [open, setOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [hasToken, setHasToken] = useState(!!localStorage.getItem("token"));

  const { pathname } = useLocation();

  const isActive = () => {
    window.scrollY > 0 ? setActive(true) : setActive(false);
  };

  useEffect(() => {
    window.addEventListener("scroll", isActive);
    return () => {
      window.removeEventListener("scroll", isActive);
    };
  }, []);

  // Fetch user from /users/me if token exists
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setCurrentUser(null);
        return;
      }
      try {
        const res = await api.get("/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = res.data;
        // Set isSeller if role is 'artisan'
        user.isSeller =
          Array.isArray(user.roles) && user.roles.includes("artisan");
        setCurrentUser(user);
      } catch (err) {
        setCurrentUser(null);
      }
    };

    if (hasToken) {
      fetchUser();
    } else {
      setCurrentUser(null);
    }
  }, [hasToken]);

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // First clear all local state
      setCurrentUser(null);
      setHasToken(false);
      setOpen(false);

      // Then clear localStorage
      localStorage.removeItem("token");

      // Try to logout on server (but don't wait for it)
      api
        .post("/auth/logout")
        .catch((err) => console.log("Logout error:", err));

      // Force a complete page reload to reset all React state
      window.location.href = "/?logout=" + new Date().getTime();
    } catch (err) {
      console.error("Logout failed:", err);
      alert("Logout failed. Please try again.");
    }
  };

  // Make token checking more robust
  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem("token");
      const hasValidToken = !!token;
      setHasToken(hasValidToken);

      // If no token, ensure user is cleared
      if (!hasValidToken) {
        setCurrentUser(null);
      }
    };

    // Check immediately
    checkToken();

    // Add event listeners
    window.addEventListener("storage", checkToken);

    // More frequent checks to catch edge cases
    const interval = setInterval(checkToken, 500);

    return () => {
      window.removeEventListener("storage", checkToken);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className={active || pathname !== "/" ? "navbar active" : "navbar"}>
      <div className="container">
        <div className="logo">
          <Link className="link" to="/">
            <span className="text">CeylonFlair</span>
          </Link>
          <span className="dot">♥</span>
        </div>
        <div className="links">
          {/* <Link className="link" to="/">
          <span>CeylonFlair</span>
          </Link> */}
          <Link className="link" to="/">
            <span>Explore</span>
          </Link>
          <Link className="link" to="/">
            <span>English</span>
          </Link>

          {!currentUser?.isSeller && (
            <Link className="link" to="/">
              <span>Become a Seller</span>
            </Link>
          )}
          {currentUser ? (
            <div className="user" onClick={() => setOpen(!open)}>
              <img
                src={
                  currentUser.profilePicture ||
                  currentUser.img ||
                  "/img/noavatar.jpg"
                }
                alt="Profile"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/img/noavatar.jpg";
                }}
              />
              <span>{currentUser?.username || currentUser?.name}</span>
              {open && (
                <div className="options">
                  <Link className="link" to="/profile/my">
                    View Profile
                  </Link>
                  {currentUser.isSeller && (
                    <>
                      <Link className="link" to="/mygigs">
                        Services
                      </Link>
                      <Link className="link" to="/add">
                        Add New Service
                      </Link>
                    </>
                  )}
                  <Link className="link" to="/orders">
                    Orders
                  </Link>
                  <Link className="link" to="/messages">
                    Messages
                  </Link>
                  <Link className="link" onClick={handleLogout}>
                    Logout
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="link">
                Sign in
              </Link>
              <Link className="link" to="/register">
                <button>Join</button>
              </Link>
            </>
          )}
        </div>
      </div>
      {(active || pathname !== "/") && (
        <>
          <hr />
          <div className="menu">
            <Link className="link menuLink" to="/">
              Handicraft Artwork
            </Link>
            <Link className="link menuLink" to="/">
              Textile
            </Link>
            <Link className="link menuLink" to="/">
              Home Decor
            </Link>
            <Link className="link menuLink" to="/">
              Jewelry & Accessories
            </Link>
            <Link className="link menuLink" to="/">
              Wellness & Beauty
            </Link>
            <Link className="link menuLink" to="/">
              Traditional Instruments
            </Link>
            <Link className="link menuLink" to="/">
              Ceremonial Arts
            </Link>
            <Link className="link menuLink" to="/">
              Handicraft Educational Services
            </Link>
          </div>
          <hr />
        </>
      )}
    </div>
  );
}

export default Navbar;
