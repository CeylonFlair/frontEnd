import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const OrderReviewPage = () => {
    const [review, setReview] = useState(null);
    const { orderId } = useParams();

    useEffect(() => {
        const fetchOrderReview = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/reviews/order/${orderId}`);
                setReview(response.data);
            } catch (error) {
                setReview(null);
                console.error("Error fetching order review:", error);
            }
        };
        if (orderId) fetchOrderReview();
    }, [orderId]);

    return (
        <div>
            <h1 className="heads">Order Review</h1>
            {/* <div className="review-list" style={{ margin: '0 auto', float: 'none', position: 'static' }}> */}
            <div className="review-list1">
                {!review ? (
                    <p>No review for this order yet.</p>
                ) : (
                    <div style={{ borderBottom: '1px solid #ccc', marginBottom: 10 }}>
                        <p><b>Feedback by: {review.reviewer?.name || review.reviewer}</b></p>
                        <p>{review.comment}  {review.rating}⭐</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderReviewPage;
