import React, { useState, useEffect, useRef } from "react";

const LazyImage = ({ src, alt, className = "", threshold = 0.1, ...props }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin: "50px",
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer?.disconnect();
    };
  }, [threshold]);

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div ref={imgRef} className="relative">
      {isVisible && (
        <img
          src={src}
          alt={alt}
          onLoad={handleImageLoad}
          className={`transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
          } ${className}`}
          loading="lazy"
          {...props}
        />
      )}
    </div>
  );
};

export default LazyImage;
