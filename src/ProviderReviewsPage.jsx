import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ProviderReviewsPage = () => {
    const [reviews, setReviews] = useState([]);
    const { providerId } = useParams();

    useEffect(() => {
        const fetchProviderReviews = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/reviews/provider/${providerId}`);
                setReviews(response.data);
            } catch (error) {
                console.error("Error fetching provider reviews:", error);
            }
        };
        if (providerId) fetchProviderReviews();
    }, [providerId]);

    return (
        <div>
            <h1 className="heads">Provider Reviews</h1>
            <div className="review-list1">
                {reviews.length === 0 ? (
                    <p>No reviews for this provider yet.</p>
                ) : (
                    reviews.map((review) => (
                        <div key={review._id} style={{ borderBottom: '1px solid #ccc', marginBottom: 10 }}>
                            <p><b>Feedback by: {review.reviewer?.name || review.reviewer}</b></p>
                            <p>{review.comment}  {review.rating}⭐</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ProviderReviewsPage;
