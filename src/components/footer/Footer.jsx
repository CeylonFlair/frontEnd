import React from "react";
import "./Footer.scss";

function Footer() {
  return (
    <div className="footer">
      <div className="container">
        <div className="top">
          <div className="item">
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
          </div>
          <div className="item">
            <h2>Looking for Something?</h2>
            <span>Become a Seller</span>
            <span>Services</span>
            <span>Messages</span>
            <span>Terms of Service</span>
            <span>Orders</span>
            <span>Register</span>
          </div>
          
          <div className="item contact">
  <h2>Contact</h2>
  <p>The cupboard under the Stairs, 4, Privet Drive, <br />Little Whinging, Surrey, England</p>
  <p><a href="tel:+13459971345">+1 345 99 71 345</a></p>
  <p><a href="tel:+13457464975">+1 345 74 64 975</a></p>
  <p><a href="mailto:info@ceylonflair.com">info@ceylonflair.com</a></p>
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
