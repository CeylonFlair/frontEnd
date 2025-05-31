import { useState } from "react";
import './App.css'

const ReviewForm = ({ onSubmit }) => {
    const [comment, setComment] = useState("");
    const [rating, setRating] = useState(5);
    const [order, setOrder] = useState("");  // orderId for backend

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Submitting review", { comment, rating, order });  
        onSubmit({ comment, rating, order });  // match backend API
        setComment("");
        setRating(5);
        setOrder("");   
    };

    return (
        <div  className="review-form" >
            <h2>Your Feedback Matters!</h2>
            <form onSubmit={handleSubmit}>
                <label>Order ID</label>
                <br />
                <input
                    type="text"
                    placeholder="enter your order id"
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    required
                />
                <br />
                <br />
                <label>Write a Review</label>
                <br />
                <textarea
                    placeholder="provide your feedback..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                />
                <br />
                <br />
                <label>Rate your Experience with us</label>
                <br />
                <div>
                    {[1, 2, 3, 4, 5].map((num) => (
                        <span
                            key={num}
                            onClick={() => setRating(num)}
                        >
                            ★
                        </span>
                    ))}
                </div>
                <br/>
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default ReviewForm;





