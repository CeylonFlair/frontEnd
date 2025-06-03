import React from "react";
import "./ProjectCard.scss";

function ProjectCard({ card }) {
  return (
    <div className="projectCard">
      <img src={card.img} alt="" />
      <div className="info">
        <img src={card.provider.profilePicture} alt="" />
        <div className="texts">
          <h2>{card.category}</h2>
          <span>{card.provider.name}</span>
        </div>
      </div>
    </div>
  );
}

export default ProjectCard;
