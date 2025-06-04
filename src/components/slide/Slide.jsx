import React, { useState, useEffect, Children, cloneElement } from "react";
import "./Slide.scss";

const Slide = ({ children, slidesToShow = 4, arrowsScroll = 1 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const childrenArray = Children.toArray(children);
  const totalSlides = childrenArray.length;

  // Rename functions to be more descriptive of their visual effect
  const moveContentLeft = () => {
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex + arrowsScroll;
      // Allow continuous scrolling by wrapping to beginning when reaching the end
      return newIndex >= totalSlides ? 0 : newIndex;
    });
  };

  const moveContentRight = () => {
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex - arrowsScroll;
      // Allow continuous scrolling by wrapping to end when reaching the beginning
      return newIndex < 0 ? Math.max(0, totalSlides - slidesToShow) : newIndex;
    });
  };

  const visibleChildren = () => {
    // Instead of only showing visible slides, render all and position them
    return childrenArray.map((child, index) => (
      <div key={index} className="slide-item">
        {child}
      </div>
    ));
  };

  return (
    <div className="slide">
      <div className="container">
        <div
          className="custom-slider"
          style={{ "--slides-to-show": slidesToShow }}
        >
          <button
            className="arrow arrow-left"
            onClick={moveContentRight}
            aria-label="Previous slide"
            style={{
              backgroundColor: "#f8f4e8",
              color: "#8b5a2b",
              borderColor: "#d7c49e",
            }}
          >
            &lt;
          </button>

          <div className="slider-container">
            <div
              className="slider-content"
              style={{
                transform: `translateX(-${
                  (currentIndex * 100) / slidesToShow
                }%)`,
                width: `${(totalSlides * 100) / slidesToShow}%`,
                transition: "transform 0.5s ease",
              }}
            >
              {visibleChildren()}
            </div>
          </div>

          <button
            className="arrow arrow-right"
            onClick={moveContentLeft}
            aria-label="Next slide"
            style={{
              backgroundColor: "#f8f4e8",
              color: "#8b5a2b",
              borderColor: "#d7c49e",
            }}
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
};

export default Slide;
