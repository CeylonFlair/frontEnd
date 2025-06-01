import React from "react";
import "./Featured.scss";

function Featured() {
  return (
    <div className="featured">
      <div className="container">
        <div className="left">
          <h1>
            Discover the soul of Sri Lanka. Handcrafted in Ceylon, with love.
          </h1>
          <div className="search">
            <div className="searchInput">
              <img src="./img/search.png" alt="" />
              <input type="text" placeholder='Discover CeylonFlair' />
            </div>
            <button>Search</button>
          </div>
          <div className="popular">
            <span>Popular:</span>
            <button>Handloom clothes</button>
            <button>Sri Lankan Spices</button>
            <button>Wood Carvings</button>
            <button>Crotchet</button>
          </div>
          
        </div>
        
        <div className="right">
          <img src="./img/featured1.png" alt="" />
        </div>
        
      </div>
     
    </div>
  );
}

export default Featured;
