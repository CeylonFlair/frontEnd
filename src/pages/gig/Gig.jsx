import React from "react";
import "./Gig.scss";
import { Slider } from "infinite-react-carousel/lib";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../utils/api";

function Gig() {
  const { id } = useParams();

  const { isLoading, error, data } = useQuery({
    queryKey: ["gig", id],
    queryFn: () => api.get(`/listings/${id}`).then((res) => res.data),
  });

  return (
    <div className="gig">
      {isLoading ? (
        "Loading..."
      ) : error ? (
        "Something went wrong!"
      ) : (
        <div className="container">
          <div className="left">
            <span className="breadcrumbs">
              CeylonFlair {">"} {data.category}
            </span>
            <h1>{data.title}</h1>
            <div className="user">
              <img
                className="pp"
                src={data.provider?.profilePicture || "/img/noavatar.jpg"}
                alt=""
              />
              <span>{data.provider?.name}</span>
              {/* Optionally show rating if available */}
              {typeof data.rating === "number" && (
                <div className="stars">
                  {Array(Math.round(data.rating))
                    .fill()
                    .map((_, i) => (
                      <img src="/img/star.png" alt="" key={i} />
                    ))}
                  <span>{data.rating}</span>
                </div>
              )}
            </div>
            <Slider slidesToShow={1} arrowsScroll={1} className="slider">
              {data.images && data.images.length > 0 ? (
                data.images.map((img) => <img key={img} src={img} alt="" />)
              ) : (
                <img src={data.coverImage} alt="" />
              )}
            </Slider>
            <h2>About This Service</h2>
            <p>{data.description}</p>
            <div className="seller">
              <h2>About The Seller</h2>
              <div className="user">
                <img
                  src={data.provider?.profilePicture || "/img/noavatar.jpg"}
                  alt=""
                />
                <div className="info">
                  <span>{data.provider?.name}</span>
                  <span style={{ fontSize: 14, color: "#888" }}>
                    {data.provider?.email}
                  </span>
                  {/* Optionally show rating */}
                  {typeof data.rating === "number" && (
                    <div className="stars">
                      {Array(Math.round(data.rating))
                        .fill()
                        .map((_, i) => (
                          <img src="/img/star.png" alt="" key={i} />
                        ))}
                      <span>{data.rating}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="box">
                <div className="items">
                  <div className="item">
                    <span className="title">Category</span>
                    <span className="desc">{data.category}</span>
                  </div>
                  <div className="item">
                    <span className="title">Created</span>
                    <span className="desc">
                      {new Date(data.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="item">
                    <span className="title">Reviews</span>
                    <span className="desc">{data.numReviews}</span>
                  </div>
                  <div className="item">
                    <span className="title">Active</span>
                    <span className="desc">{data.isActive ? "Yes" : "No"}</span>
                  </div>
                </div>
                <hr />
                {/* Optionally show more about provider */}
              </div>
            </div>
            {/* You can add reviews here if you have them */}
          </div>
          <div className="right">
            <div className="price">
              <h3>{data.title}</h3>
              <h2>Rs {data.price}</h2>
            </div>
            <p>{data.shortDesc || data.description?.slice(0, 100) + "..."}</p>
            <div className="details">
              <div className="item">
                <img src="/img/clock.png" alt="" />
                <span>{data.deliveryTime} Days Delivery</span>
              </div>
              <div className="item">
                <img src="/img/recycle.png" alt="" />
                <span>
                  {data.numberOfRevisions === -1
                    ? "Unlimited"
                    : `${data.numberOfRevisions} Revisions`}
                </span>
              </div>
            </div>
            <div className="features">
              {data.features &&
                data.features.map((feature) => (
                  <div className="item" key={feature}>
                    <img src="/img/greencheck.png" alt="" />
                    <span>{feature}</span>
                  </div>
                ))}
            </div>
            <Link to={`/pay/${data._id}`}>
              <button>Continue</button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Gig;
