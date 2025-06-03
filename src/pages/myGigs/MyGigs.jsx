import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./MyGigs.scss";
import api from "../../utils/api";

function MyGigs() {
  const currentUser = {
    id: 1,
    username: "Anna",
    isSeller: true,
  };

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
          <h1>{currentUser.isSeller ? "Gigs" : "Orders"}</h1>
          {currentUser.isSeller && (
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
