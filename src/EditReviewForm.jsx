import { useState } from "react";
import './App.css';

const EditReviewForm = ({ review, onSubmit, onCancel }) => {
    const [comment, setComment] = useState(review.comment);
    const [rating, setRating] = useState(review.rating);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ rating, comment });
    };

    return (
        <div className="review-form">
            <h2>Edit Your Review</h2>
            <form onSubmit={handleSubmit}>
                <label>Write a Review</label>
                <br />
                <textarea
                    placeholder="update your feedback..."
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
                            style={{ cursor: 'pointer', color: rating >= num ? '#ffc107' : '#ccc' }}
                        >
                            ★
                        </span>
                    ))}
                </div>
                <br />
                <button type="submit">Update</button>
                <button type="button" onClick={onCancel} style={{ marginLeft: '10px' }}>Cancel</button>
            </form>
        </div>
    );
};

export default EditReviewForm;
