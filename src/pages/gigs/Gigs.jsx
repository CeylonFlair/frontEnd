import React, { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Gigs.scss";
import GigCard from "../../components/gigCard/GigCard";
import api from "../../utils/api";

function Gigs() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sort, setSort] = useState("newest");
  const [open, setOpen] = useState(false);
  const minRef = useRef();
  const maxRef = useRef();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Combine the two useEffects to avoid double loading
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const kw = params.get("keyword") || "";
    const min = params.get("minPrice") || "";
    const max = params.get("maxPrice") || "";
    const cat = params.get("category") || "";

    // Update state with URL parameters
    setKeyword(kw);
    setSearchInput(kw);
    setMinPrice(min);
    setMaxPrice(max);
    setCategory(cat);

    // Make the API call with these parameters
    const fetchListings = async () => {
      setLoading(true);
      setError("");
      try {
        const apiParams = {};
        if (cat) apiParams.category = cat;
        if (min) apiParams.minPrice = min;
        if (max) apiParams.maxPrice = max;
        if (sort) apiParams.sort = sort;
        if (kw) apiParams.keyword = kw;
        apiParams.page = page;
        apiParams.limit = limit;

        const res = await api.get("/listings", { params: apiParams });
        setListings(res.data.listings || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load listings"
        );
      }
      setLoading(false);
    };
    fetchListings();
  }, [location.search, sort, page, limit]); // Dependencies include URL parameters and sort/pagination

  const reSort = (type) => {
    setSort(type);
    setOpen(false);
  };

  const apply = () => {
    setMinPrice(minRef.current.value);
    setMaxPrice(maxRef.current.value);
  };

  // When category changes, update URL to trigger API call via location change
  useEffect(() => {
    // Skip on initial render or when category is empty (this prevents double API calls)
    if (category === "" && !location.search.includes("category=")) return;

    // Build URL with category and other existing params
    const params = new URLSearchParams(location.search);
    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }
    navigate(`/gigs?${params.toString()}`, { replace: true });
  }, [category, navigate, location.search]);

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();

    // Build query params object
    const params = new URLSearchParams();
    if (searchInput.trim()) params.set("keyword", searchInput.trim());
    if (minRef.current?.value) params.set("minPrice", minRef.current.value);
    if (maxRef.current?.value) params.set("maxPrice", maxRef.current.value);
    if (category) params.set("category", category);

    // Navigate to update URL (which triggers API call via location change)
    navigate(`/gigs?${params.toString()}`, { replace: true });
  };

  // Handle category change
  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    // URL update is handled by the useEffect above
  };

  // Add controlled state for search input
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    setSearchInput(keyword);
  }, [keyword]);

  // Category options
  const categories = [
    "Handicraft Artwork",
    "Textile Creation",
    "Home Decor",
    "Jewelry & Accessories",
    "Wellness & Beauty",
    "Ceremonial Arts",
    "Educational Services",
  ];

  // Add handler for resetting all filters
  const handleResetFilters = () => {
    // First clear all state values
    setKeyword("");
    setSearchInput("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    // Reset sort as well
    setSort("newest");

    // Clear the form references if they exist
    if (minRef.current) minRef.current.value = "";
    if (maxRef.current) maxRef.current.value = "";

    // Clear URL parameters by navigating to base gigs page
    navigate("/gigs", { replace: true });

    // Force a re-fetch with no filters
    const fetchListings = async () => {
      setLoading(true);
      try {
        const res = await api.get("/listings");
        setListings(res.data.listings || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load listings"
        );
      }
      setLoading(false);
    };
    fetchListings();
  };

  return (
    <div className="gigs">
      <div className="container">
        <p style={{ fontWeight: 500, fontSize: 20, margin: "24px 0 12px 0" }}>
          Handcrafted elegance, made in Sri Lanka.
        </p>
        <div className="menu">
          <div className="left">
            <span
              style={{
                fontWeight: 500,
                marginRight: 8,
                color: "#7c3a3a",
                fontSize: 16,
              }}
            >
              Category
            </span>
            <select
              value={category}
              onChange={handleCategoryChange} // Use the new handler
              style={{
                marginRight: 18,
                minWidth: 180,
                padding: "7px 14px",
                borderRadius: 6,
                border: "1.5px solid #bf7e7e",
                fontSize: 15,
                background: "#f9f6f6",
                color: "#7c3a3a",
                fontWeight: 500,
                outline: "none",
                boxShadow: "0 1px 4px #eee",
                cursor: "pointer",
              }}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <span
              style={{
                fontWeight: 500,
                marginRight: 8,
                color: "#7c3a3a",
                fontSize: 16,
              }}
            >
              Budget
            </span>
            <input
              ref={minRef}
              type="number"
              placeholder="min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              style={{
                width: 70,
                padding: "7px 10px",
                borderRadius: 6,
                border: "1.5px solid #bf7e7e",
                marginRight: 6,
                fontSize: 15,
                background: "#f9f6f6",
                color: "#7c3a3a",
                outline: "none",
              }}
            />
            <input
              ref={maxRef}
              type="number"
              placeholder="max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              style={{
                width: 70,
                padding: "7px 10px",
                borderRadius: 6,
                border: "1.5px solid #bf7e7e",
                marginRight: 12,
                fontSize: 15,
                background: "#f9f6f6",
                color: "#7c3a3a",
                outline: "none",
              }}
            />
            {/* <button onClick={apply}>Apply</button> */}
            <form onSubmit={handleSearch} style={{ display: "inline" }}>
              <input
                type="text"
                name="keyword"
                placeholder="Search..."
                style={{
                  marginLeft: 8,
                  padding: "7px 14px",
                  borderRadius: 6,
                  border: "1.5px solid #bf7e7e",
                  fontSize: 15,
                  background: "#f9f6f6",
                  color: "#7c3a3a",
                  outline: "none",
                  minWidth: 140,
                }}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <button
                type="submit"
                style={{
                  marginLeft: 4,
                  padding: "7px 18px",
                  borderRadius: 6,
                  border: "none",
                  background: "#bf7e7e",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: "pointer",
                  boxShadow: "0 1px 4px #eee",
                }}
              >
                Search
              </button>
              {/* Add Reset button */}
              <button
                type="button"
                onClick={handleResetFilters}
                style={{
                  marginLeft: 8,
                  padding: "7px 18px",
                  borderRadius: 6,
                  border: "1px solid #bf7e7e",
                  background: "#fff",
                  color: "#bf7e7e",
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: "pointer",
                  boxShadow: "0 1px 4px #eee",
                }}
              >
                Reset
              </button>
            </form>
          </div>
          <div className="right">
            <span className="sortBy">Sort by</span>
            <span className="sortType">
              {sort === "popular"
                ? "Popular"
                : sort === "newest"
                ? "Newest"
                : "Best Selling"}
            </span>
            <img src="./img/down.png" alt="" onClick={() => setOpen(!open)} />
            {open && (
              <div className="rightMenu">
                {sort !== "newest" && (
                  <span onClick={() => reSort("newest")}>Newest</span>
                )}
                {sort !== "popular" && (
                  <span onClick={() => reSort("popular")}>Popular</span>
                )}
              </div>
            )}
          </div>
        </div>
        <div
          className="cards"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "24px",
          }}
        >
          {loading ? (
            <div style={{ padding: 32 }}>Loading...</div>
          ) : error ? (
            <div style={{ color: "#c0392b", padding: 32 }}>{error}</div>
          ) : Array.isArray(listings) && listings.length > 0 ? (
            listings.map((gig) => (
              <div
                key={gig._id}
                style={{ minWidth: 0, cursor: "pointer" }}
                onClick={() => (window.location.href = `/gig/${gig._id}`)}
              >
                <GigCard
                  item={{
                    ...gig,
                    star: gig.rating,
                    title: gig.title,
                    img: gig.coverImage || (gig.images && gig.images[0]) || "",
                    pp:
                      (gig.provider && gig.provider.profilePicture) ||
                      (gig.provider && gig.provider.profile_picture) ||
                      (gig.provider && gig.provider.img) ||
                      "/img/noavatar.jpg",
                    username: gig.provider?.name || "",
                  }}
                />
              </div>
            ))
          ) : (
            <div style={{ padding: 32, color: "#888" }}>No gigs found.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Gigs;
