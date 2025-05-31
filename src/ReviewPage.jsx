import { useState, useEffect } from "react";
import axios from "axios";
import ReviewForm from "./ReviewForm";
import EditReviewForm from "./EditReviewForm";
import { useParams } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // to read the env file

const ReviewPage = () => {
    const [reviews, setReviews] = useState([]);
    const [editingReview, setEditingReview] = useState(null);
    const { listingId } = useParams();

    // get JWT token from localStorage
    const token = localStorage.getItem("token");
    // Simulate logged-in user id (replace with real auth logic)
    const userId = localStorage.getItem("userId");

    const fetchReviews = async () => {
        try {
            // fetch reviews for a specific listing
            const response = await axios.get(`${API_BASE_URL}/api/reviews/listing/${listingId}`);
            setReviews(response.data);
        } catch (error) {
            console.error("Error fetching reviews:", error);
        }
    };

    const handleReviewSubmit = async (newReview) => {
        try {
            // to submit review with JWT token
            await axios.post(
                `${API_BASE_URL}/api/reviews`,
                newReview,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            fetchReviews();  //to refresh reviews
        } catch (error) {
            console.error("Error submitting review:", error.response?.data || error);
            alert(error.response?.data?.message || "Failed to submit review");
        }
    };

    const handleEditClick = (review) => {
        setEditingReview(review);
    };

    const handleEditSubmit = async (updatedFields) => {
        try {
            await axios.put(
                `${API_BASE_URL}/api/reviews/${editingReview._id}`,
                updatedFields,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setEditingReview(null);
            fetchReviews();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to update review");
        }
    };

    const handleDelete = async (reviewId) => {
        if (!window.confirm("Are you sure you want to delete this review?")) return;
        try {
            await axios.delete(`${API_BASE_URL}/api/reviews/${reviewId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchReviews();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to delete review");
        }
    };

    useEffect(() => {
        if (listingId) fetchReviews();
    }, [listingId]);

    return (
        <div>
            <h1 className="heads">We'd love to hear your feedback!</h1>
            {editingReview ? (
                <EditReviewForm
                    review={editingReview}
                    onSubmit={handleEditSubmit}
                    onCancel={() => setEditingReview(null)}
                />
            ) : (
                <ReviewForm onSubmit={handleReviewSubmit} />
            )}
            <div className="review-list">
                <h2>User Reviews & Ratings</h2>
                {reviews.length === 0 ? (
                    <p>No reviews yet.</p>
                ) : (
                    reviews.map((review) => (
                        <div key={review._id} style={{ borderBottom: '1px solid #ccc', marginBottom: 10 }}>
                            <p><b>Feedback by: {review.reviewer?.name || review.reviewer}</b></p>
                            <p>{review.comment}  {review.rating}⭐</p>
                            {userId && review.reviewer === userId && (
                                <>
                                    <button onClick={() => handleEditClick(review)}>Edit</button>
                                    <button onClick={() => handleDelete(review._id)} style={{ marginLeft: '10px' }}>Delete</button>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ReviewPage;

