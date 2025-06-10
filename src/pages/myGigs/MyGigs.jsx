import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./MyGigs.scss";
import api from "../../utils/api";

function MyGigs() {
  const currentUser = {
    id: 1,
    username: "Anna",
    isSeller: true,
    // role: "artisan", // Uncomment and set this if you want to test artisan logic
  };

  const [listings, setListings] = useState([]);
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      setError("");
      try {
        let res;
        // Use localStorage user if available for role/id
        let user = currentUser;
        try {
          const stored = JSON.parse(localStorage.getItem("user"));
          if (stored) user = stored;
        } catch {}
        if (user?.roles?.includes("artisan") || user?.role === "artisan") {
          // Use a valid ObjectId for providerId (replace with actual logic)
          const providerId = user._id || user.id || "684773b8ab352e75aaf79107"; // fallback to demo ObjectId
          res = await api.get(`/listings/${providerId}/with-provider`);
          setProvider(res.data.provider);
          setListings(res.data.listings || []);
        } else {
          res = await api.get("/listings");
          setProvider(null);
          setListings(res.data.listings || []);
        }
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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this listing?"))
      return;
    try {
      await api.delete(`/listings/${id}`);
      setListings((prev) => prev.filter((gig) => gig._id !== id));
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to delete listing"
      );
    }
  };

  return (
    <div className="myGigs">
      <div className="container">
        <div className="title">
          <h1>
            {provider ? "My Gigs" : currentUser.isSeller ? "Gigs" : "Orders"}
          </h1>
          {(provider || currentUser.isSeller) && (
            <Link to="/add">
              <button>Add New Gig</button>
            </Link>
          )}
        </div>
        {error && (
          <div style={{ color: "#c0392b", marginBottom: 12 }}>{error}</div>
        )}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>View</th>
                <th>Price</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((gig) => (
                <tr key={gig._id}>
                  <td>
                    <img
                      className="image"
                      src={
                        gig.coverImage || (gig.images && gig.images[0]) || ""
                      }
                      alt={gig.title}
                    />
                  </td>
                  <td>{gig.title}</td>
                  <td>
                    <Link to={`/gig/${gig._id}`}>
                      <button
                        style={{
                          background: "#f3eaea",
                          color: "#7c3a3a",
                          border: "none",
                          borderRadius: "4px",
                          padding: "6px 16px",
                          cursor: "pointer",
                          fontWeight: 500,
                        }}
                      >
                        View
                      </button>
                    </Link>
                  </td>
                  <td>{gig.price}</td>
                  <td>
                    <img
                      className="delete"
                      src="./img/delete.png"
                      alt="Delete"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleDelete(gig._id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default MyGigs;
