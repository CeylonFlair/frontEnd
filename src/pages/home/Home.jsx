import React, { useEffect, useState } from "react";
import "./Home.scss";
import Featured from "../../components/featured/Featured";
import TrustedBy from "../../components/trustedBy/TrustedBy";
import Slide from "../../components/slide/Slide";
import CatCard from "../../components/catCard/CatCard";
import ProjectCard from "../../components/projectCard/ProjectCard";
import { cards } from "../../data";
import api from "../../utils/api"; // <-- import your axios instance

function Home() {
  // Fetch listings for ProjectCard
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch from /listings using axios
    const fetchListings = async () => {
      setLoading(true);
      try {
        const res = await api.get("/listings");
        setListings(res.data.listings || []);
      } catch (err) {
        setListings([]);
      }
      setLoading(false);
    };
    fetchListings();
  }, []);

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
            <img src="/img/promotion.png" alt="" />
          </div>

          <div className="item">
            <h1>
              Introducing <i>CeylonFlair Pro</i>
            </h1>
            <h1>More tools. More reach. More flair</h1>
            <p>
              Upgrade to a curated seller experience designed to grow your
              creative business
            </p>
            <div className="title">
              <img src="/img/check.png" alt="" />
              Get discovered faster with priority placement on the homepage and
              search results
            </div>

            <div className="title">
              <img src="/img/check.png" alt="" />
              Showcase your credibility with a Verified Artisan badge proudly
              displayed on your profil
            </div>

            <div className="title">
              <img src="/img/check.png" alt="" />
              Enjoy one-on-one support from a dedicated success manager for
              guidance and growth
            </div>
            <div className="title">
              <img src="/img/check.png" alt="" />
              Unlock exclusive seller tools, premium listing features, and
              seasonal marketing boosts
            </div>
            <button
              onClick={() => {
                window.location.href =
                  "mailto:info@ceylonflair.com?subject=Beta Program Inquiry&body=Hi CeylonFlair Team,%0D%0A%0D%0AI'd love to join the CeylonFlair Pro Beta Program. Please let me know the next steps.%0D%0A%0D%0AThanks!%0D%0A[Your Name]";
              }}
            >
              Join the Beta Program
            </button>
          </div>
        </div>
      </div>
      {/* ProjectCard section */}
      {loading ? (
        <div style={{ padding: 32 }}>Loading...</div>
      ) : Array.isArray(listings) && listings.length > 0 ? (
        <Slide
          slidesToShow={Math.min(4, listings.length)}
          arrowsScroll={Math.min(4, listings.length)}
        >
          {listings.map((listing) => (
            <div
              key={listing._id}
              style={{ cursor: "pointer" }}
              onClick={() => (window.location.href = `/gig/${listing._id}`)}
            >
              <ProjectCard
                card={{
                  ...listing,
                  img: listing.coverImage,
                }}
              />
            </div>
          ))}
        </Slide>
      ) : (
        <div style={{ padding: 32, textAlign: "center", color: "#888" }}>
          No projects found.
        </div>
      )}
    </div>
  );
}

export default Home;
