import { useState, useEffect } from "react";
import axios from "axios";
import ReviewForm from "./ReviewForm";

const ReviewPage = () => {
    const [reviews, setReviews] = useState([]);

    const fetchReviews = async () => {
        try {
            const response = await axios.get("http://localhost:5050/api/reviews");
            setReviews(response.data);
        } catch (error) {
            console.error("Error fetching reviews:", error);
        }
    };

    const handleReviewSubmit = async (newReview) => {
        console.log("Received new review:", newReview);  
    
        try {
            const response = await axios.post("http://localhost:5050/api/reviews", newReview);
            console.log("Review submitted:", response.data);  
            fetchReviews();  
        } catch (error) {
            console.error("Error submitting review:", error.response?.data || error);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    return (
        <div>
            <h1 className="heads">We'd love to hear your feedback!</h1> 
            <ReviewForm onSubmit={handleReviewSubmit} />
            <div className="review-list">
                <h2>User Reviews & Ratings</h2>
                {reviews.map((review) => (
                    // <div key={review._id}>
                    <div key={review.productId}>
                        <p><b>Feedback by: {review.user} </b></p>
                        <p>{review.comment}  {review.rating}⭐</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReviewPage;

