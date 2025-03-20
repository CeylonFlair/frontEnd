import { useState } from "react";
import './App.css'

const ReviewForm = ({ onSubmit }) => {
    const [comment, setComment] = useState("");
    const [rating, setRating] = useState(5);
    const [productId, setProductId] = useState("");  
    const [user, setUser] = useState("");            

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Submitting review", { comment, rating, productId, user });  
        onSubmit({ comment, rating, productId, user });  
        setComment("");
        setRating(5);
        setProductId("");   
        setUser("");        
    };

    return (
        <div  className="review-form" >
            <h2>Your Feedback Matters!</h2>
            <form onSubmit={handleSubmit}>
                <label>Product ID</label>
                <br />
                <input
                    type="text"
                    placeholder="enter the product id"
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    required
                />
                <br />
                <br />
                
                <label>Username</label>
                <br />
                <input
                    type="text"
                    placeholder="enter your name"
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
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





