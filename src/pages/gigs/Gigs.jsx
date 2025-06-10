import React, { useRef, useState, useEffect } from "react";
import "./Gigs.scss";
import GigCard from "../../components/gigCard/GigCard";
import api from "../../utils/api";

function Gigs() {
  const [sort, setSort] = useState("sales");
  const [open, setOpen] = useState(false);
  const minRef = useRef();
  const maxRef = useRef();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      setError("");
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
  }, []);

  const reSort = (type) => {
    setSort(type);
    setOpen(false);
  };

  const apply = () => {
    // Optionally implement budget filter logic here
    // For now, just log values
    console.log(minRef.current.value);
    console.log(maxRef.current.value);
  };

  return (
    <div className="gigs">
      <div className="container">
        <span className="breadcrumbs">CeylonFlair Jewelry & Accessories </span>
        <h1>Jewelry</h1>
        <p>Handcrafted elegance, made in Sri Lanka.</p>
        <div className="menu">
          <div className="left">
            <span>Budget</span>
            <input ref={minRef} type="number" placeholder="min" />
            <input ref={maxRef} type="number" placeholder="max" />
            <button onClick={apply}>Apply</button>
          </div>
          <div className="right">
            <span className="sortBy">Sort by</span>
            <span className="sortType">
              {sort === "sales" ? "Best Selling" : "Newest"}
            </span>
            <img src="./img/down.png" alt="" onClick={() => setOpen(!open)} />
            {open && (
              <div className="rightMenu">
                {sort === "sales" ? (
                  <span onClick={() => reSort("createdAt")}>Newest</span>
                ) : (
                  <span onClick={() => reSort("sales")}>Best Selling</span>
                )}
                <span onClick={() => reSort("sales")}>Popular</span>
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
              <div key={gig._id} style={{ minWidth: 0 }}>
                <GigCard
                  item={{
                    ...gig,
                    star: gig.rating,
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
