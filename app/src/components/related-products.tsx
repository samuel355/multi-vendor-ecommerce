import React, { useEffect, useState } from "react";

const products = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  name: `Product ${i + 1}`,
  image: `/product${i + 1}.jpg`,
}));

const ProductCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const visibleProducts = 7; // Number of products visible at a time

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0
        ? Math.max(products.length - visibleProducts, 0) // Jump to the last batch
        : prevIndex - visibleProducts
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex + visibleProducts >= products.length
        ? 0 // Jump back to the beginning
        : prevIndex + visibleProducts
    );
  };

  useEffect(() => {
    const interval = setInterval(() => {
      goToNext();
    }, 3000);

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  return (
    <div className="relative w-full max-w-6xl mx-auto overflow-hidden">
      {/* Carousel Items */}
      <div
        className="flex transition-transform duration-500"
        style={{
          transform: `translateX(-${(currentIndex / visibleProducts) * 100}%)`,
          width: `${(products.length / visibleProducts) * 100}%`,
        }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-1/7 p-2 flex justify-center items-center"
          >
            <div className="bg-white shadow-lg rounded-lg p-4 w-full">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-36 object-cover rounded"
              />
              <h3 className="mt-2 text-center text-sm font-medium">
                {product.name}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Left Arrow */}
      <button
        onClick={goToPrevious}
        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 focus:outline-none"
      >
        &#9664;
      </button>

      {/* Right Arrow */}
      <button
        onClick={goToNext}
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 focus:outline-none"
      >
        &#9654;
      </button>
    </div>
  );
};

export default ProductCarousel;
