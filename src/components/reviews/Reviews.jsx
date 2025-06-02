import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import newRequest from "../../utils/newRequest";
import Review from "../review/Review";
import "./Reviews.scss";

const Reviews = ({ gigId, providerId, listingId, orderId }) => {
  const queryClient = useQueryClient();
  const [editingReview, setEditingReview] = useState(null);
  const [desc, setDesc] = useState("");
  const [star, setStar] = useState(5);
  const [order, setOrder] = useState("");
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  // Determine API endpoint based on props
  let reviewsUrl = "";
  if (providerId) reviewsUrl = `/reviews/provider/${providerId}`;
  else if (listingId) reviewsUrl = `/reviews/listing/${listingId}`;
  else if (orderId) reviewsUrl = `/reviews/order/${orderId}`;
  else reviewsUrl = `/reviews/${gigId}`;

  const { isLoading, error, data: reviews = [] } = useQuery({
    queryKey: ["reviews", providerId, listingId, orderId, gigId],
    queryFn: () => newRequest.get(reviewsUrl).then((res) => res.data),
    enabled: !!reviewsUrl,
  });

  // Add review
  const addMutation = useMutation({
    mutationFn: (review) =>
      newRequest.post("/reviews", review, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["reviews"]);
      setDesc("");
      setStar(5);
      setOrder("");
    },
  });

  // Edit review
  const editMutation = useMutation({
    mutationFn: ({ id, ...fields }) =>
      newRequest.put(`/reviews/${id}`, fields, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["reviews"]);
      setEditingReview(null);
    },
  });

  // Delete review
  const deleteMutation = useMutation({
    mutationFn: (id) =>
      newRequest.delete(`/reviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["reviews"]);
    },
  });

  const handleAdd = (e) => {
    e.preventDefault();
    addMutation.mutate({
      comment: desc,
      rating: star,
      order: order,
      providerId,
      listingId,
      gigId,
      orderId,
    });
  };

  const handleEdit = (e) => {
    e.preventDefault();
    editMutation.mutate({
      id: editingReview._id,
      comment: desc,
      rating: star,
    });
  };

  return (
    <div className="reviews">
      <h2>Reviews</h2>
      {isLoading ? (
        "loading"
      ) : error ? (
        "Something went wrong!"
      ) : reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        reviews.map((review) => (
          <div
            key={review._id}
            style={{ borderBottom: "1px solid #ccc", marginBottom: 10 }}
          >
            <Review review={review} />
            {userId && (review.reviewer === userId || review.reviewer?._id === userId) && (
              <>
                <button
                  onClick={() => {
                    setEditingReview(review);
                    setDesc(review.comment);
                    setStar(review.rating);
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteMutation.mutate(review._id)}
                  style={{ marginLeft: "10px" }}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        ))
      )}
      <div className="add">
        <h3>{editingReview ? "Edit Your Review" : "Add a review"}</h3>
        <form
          className="addForm"
          onSubmit={editingReview ? handleEdit : handleAdd}
        >
          {/* Order ID input only for add, not edit */}
          {!editingReview && (
            <>
              <label>Order ID</label>
              <input
                type="text"
                placeholder="enter your order id"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                required={!!orderId}
              />
            </>
          )}
          <label>Write a Review</label>
          <textarea
            placeholder="provide your feedback..."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            required
          />
          <label>Rate your Experience with us</label>
          <div>
            {[1, 2, 3, 4, 5].map((num) => (
              <span
                key={num}
                onClick={() => setStar(num)}
                style={{
                  cursor: "pointer",
                  color: star >= num ? "#ffc107" : "#ccc",
                  fontSize: 24,
                }}
              >
                ★
              </span>
            ))}
            <span style={{ marginLeft: 8 }}>
              {star} star{star > 1 ? "s" : ""}
            </span>
          </div>
          <button type="submit">
            {editingReview ? "Update" : "Submit"}
          </button>
          {editingReview && (
            <button
              type="button"
              onClick={() => setEditingReview(null)}
              style={{ marginLeft: "10px" }}
            >
              Cancel
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default Reviews;
