// src/app/Component/RestaurantCard.js
import React, { useState, useRef, useEffect } from "react";

export default function RestaurantCard({ restaurant, onSwipe, style, forceSwipe }) {
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const startPos = useRef(null);

  const handlePointerDown = (e) => {
    if (isAnimating || restaurant.userVote) return;
    startPos.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !startPos.current || isAnimating || restaurant.userVote) return;
    const deltaX = e.clientX - startPos.current.x;
    const deltaY = e.clientY - startPos.current.y;
    setTranslate({ x: deltaX, y: deltaY });
  };

  const handlePointerUp = () => {
    if (isAnimating || restaurant.userVote) return;
    setIsDragging(false);
    if (Math.abs(translate.x) > 100) {
      const direction = translate.x > 0 ? "right" : "left";
      onSwipe(direction, restaurant);
    }
    setTranslate({ x: 0, y: 0 });
    startPos.current = null;
  };

  useEffect(() => {
    if (forceSwipe && !restaurant.userVote) {
      setIsAnimating(true);
      const targetX = forceSwipe === "right" ? window.innerWidth : -window.innerWidth;
      setTranslate({ x: targetX, y: 0 });
      const timer = setTimeout(() => {
        onSwipe(forceSwipe, restaurant);
        setIsAnimating(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [forceSwipe, onSwipe, restaurant]);


  useEffect(() => {
    if (!forceSwipe) {
      setTranslate({ x: 0, y: 0 });
      setIsAnimating(false);
    }
  }, [forceSwipe]);

  return (
    <div
      className="absolute w-full max-w-xl bg-white rounded-md shadow-lg overflow-hidden"
      style={{
        ...style,
        transform: `translate(${translate.x}px, ${translate.y}px) rotate(${translate.x / 10}deg)`,
        transition: isDragging ? "none" : "transform 0.3s ease-out",
        pointerEvents: isAnimating || restaurant.userVote ? "none" : "auto",
        opacity: isAnimating ? 1 : 1,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <img
        src={restaurant.imageUrl}
        alt={restaurant.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <div>
          <h3 className="inline text-xl font-bold">{restaurant.name}&nbsp;</h3>
          <p className="inline text-gray-600">{restaurant.priceLevel}</p>
        </div>
        <p className="text-gray-600">{restaurant.description}</p>
        <div className="mt-2">
          <p className="inline text-gray-600">Rating: {restaurant.rating}⭐</p>
          <p className="inline text-gray-600 ml-2">({restaurant.userTotalRating} reviews)</p>
        </div>
        <p className="text-gray-600 mt-1">Cuisine: {restaurant.types}</p>
        <p className={restaurant.isOpen === null ? "text-gray-600" : restaurant.isOpen ? "text-green-600" : "text-red-600"}>
          {restaurant.isOpen === null ? "Hours not available" : restaurant.isOpen ? "Open now" : "Currently Closed"}
        </p>
      </div>
    </div>
  );
}