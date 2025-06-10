import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Featured.scss";

function Featured() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  // Automatically navigate to gigs page when search input changes
  useEffect(() => {
    // Use a debounce to avoid navigation on every keystroke
    const timeoutId = setTimeout(() => {
      if (search.trim()) {
        navigate(`/gigs?keyword=${encodeURIComponent(search.trim())}`);
      }
    }, 800); // Wait for 800ms of inactivity before navigating

    return () => clearTimeout(timeoutId);
  }, [search, navigate]);

  const handleSearchClick = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/gigs?keyword=${encodeURIComponent(search.trim())}`);
    } else {
      navigate("/gigs");
    }
  };

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
              <input
                type="text"
                placeholder="Discover CeylonFlair"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button onClick={handleSearchClick}>Search</button>
          </div>
          {/* <div className="popular">
            <span>Popular:</span>
            <button onClick={() => navigate("/gigs?keyword=Handloom clothes")}>
              Handloom clothes
            </button>
            <button onClick={() => navigate("/gigs?keyword=Sri Lankan Spices")}>
              Sri Lankan Spices
            </button>
            <button onClick={() => navigate("/gigs?keyword=Wood Carvings")}>
              Wood Carvings
            </button>
            <button onClick={() => navigate("/gigs?keyword=Crotchet")}>
              Crotchet
            </button>
          </div> */}
        </div>

        <div className="right">
          <img src="./img/featured1.png" alt="" />
        </div>
      </div>
    </div>
  );
}

export default Featured;
