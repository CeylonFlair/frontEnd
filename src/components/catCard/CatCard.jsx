import React from "react";
import { useNavigate } from "react-router-dom";
import "./CatCard.scss";

function CatCard({ card }) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    // Navigate to gigs page with the category as a query parameter
    navigate(`/gigs?category=${encodeURIComponent(card.title)}`);
  };

  return (
    <div className="catCard" onClick={handleCardClick}>
      <img src={card.img} alt="" />
      <span className="desc">{card.desc}</span>
      <span className="title">{card.title}</span>
    </div>
  );
}

export default CatCard;
