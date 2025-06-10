import React from "react";
import { Link } from "react-router-dom";
import "./Footer.scss";

function Footer() {
  // Get current user from localStorage
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  // Check if user is an artisan
  const isArtisan = currentUser?.roles?.includes("artisan");

  return (
    <div className="footer">
      <div className="container">
        <div className="top">
          {/* <div className="item">
            <h2>Categories</h2>
            <span></span>
            <span>Handicraft Artwork</span>
            <span>Textile Creation</span>
            <span>Home Decor</span>
            <span>Jewelry & Accessories</span>
            <span>Wellness & Beauty</span>
            <span>Traditional Instruments</span>
            <span>Ceremonial Arts</span>
            <span>Educational Services</span>
          </div> */}
          <div className="item">
            <h2>Looking for Something?</h2>
            <Link to="/register?seller=true" className="footer-link">
              <span>Become a Seller</span>
            </Link>
            {isArtisan && (
              <Link to="/mygigs" className="footer-link">
                <span>Services</span>
              </Link>
            )}
            <Link to="/messages" className="footer-link">
              <span>Messages</span>
            </Link>
            <Link to="/terms" className="footer-link">
              <span>Terms of Service</span>
            </Link>
            <Link to="/orders" className="footer-link">
              <span>Orders</span>
            </Link>
            <Link to="/register" className="footer-link">
              <span>Register</span>
            </Link>
          </div>

          <div className="item contact">
            <h2>Contact</h2>
            <p>
              The cupboard under the Stairs, 4, Privet Drive, <br />
              Little Whinging, Surrey, England
            </p>
            <p>
              <a href="tel:+13459971345">+1 345 99 71 345</a>
            </p>
            <p>
              <a href="tel:+13457464975">+1 345 74 64 975</a>
            </p>
            <p>
              <a href="mailto:info@ceylonflair.com">info@ceylonflair.com</a>
            </p>
          </div>
        </div>
        <hr />
        <div className="bottom">
          <div className="left">
            <h2>CeylonFlair</h2>
            <span>© CeylonFlair 2025</span>
          </div>
          <div className="right">
            <div className="social">
              <img src="/img/twitter.png" alt="" />
              <img src="/img/facebook.png" alt="" />
              <img src="/img/linkedin.png" alt="" />
              <img src="/img/pinterest.png" alt="" />
              <img src="/img/instagram.png" alt="" />
            </div>
            <div className="link">
              <img src="/img/language.png" alt="" />
              <span>English</span>
            </div>
            <div className="link">
              <img src="/img/coin.png" alt="" />
              <span>USD</span>
            </div>
            <img src="/img/accessibility.png" alt="" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;
