import React from "react";
import "./Home.scss";
import Featured from "../../components/featured/Featured";
import TrustedBy from "../../components/trustedBy/TrustedBy";
import Slide from "../../components/slide/Slide";
import CatCard from "../../components/catCard/CatCard";
import ProjectCard from "../../components/projectCard/ProjectCard";
import { cards, projects } from "../../data";

function Home() {
  return (
    <div className="home">
      <Featured />
      <TrustedBy />
      <Slide slidesToShow={5} arrowsScroll={5}>
        {cards.map((card) => (
          <CatCard key={card.id} card={card} />
        ))}
      </Slide>
      
      
      <div className="features dark">
        <div className="container">
          <div className="item">
            <h1>
              Introducing <i>CeylonFlair Pro</i>
            </h1>
            <h1>More tools. More reach. More flair
            </h1>
            <p>
              Upgrade to a curated seller experience designed to grow your creative business
            </p>
            <div className="title">
              <img src="./img/check.png" alt="" />
              Get discovered faster with priority placement on the homepage and search results
            </div>

            <div className="title">
              <img src="./img/check.png" alt="" />
              Showcase your credibility with a Verified Artisan badge proudly displayed on your profil
            </div>

            <div className="title">
              <img src="./img/check.png" alt="" />
              Enjoy one-on-one support from a dedicated success manager for guidance and growth
            </div>
            <div className="title">
              <img src="./img/check.png" alt="" />
              Unlock exclusive seller tools, premium listing features, and seasonal marketing boosts
            </div>
            <button>Join the Beta Program</button>
          </div>
          <div className="item">
            <img
              src="../../../public/img/promotion.png"
              alt=""
            />
          </div>
        </div>
      </div>
      <Slide slidesToShow={4} arrowsScroll={4}>
        {projects.map((card) => (
          <ProjectCard key={card.id} card={card} />
        ))}
      </Slide>
    </div>
  );
}

export default Home;
