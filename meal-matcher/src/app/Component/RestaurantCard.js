// src/app/Component/RestaurantCard.js
import React, { useState, useRef, useEffect } from "react";

export default function RestaurantCard({ restaurant, onSwipe, style, forceSwipe }) {
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const startPos = useRef(null);

  const handlePointerDown = (e) => {
    startPos.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !startPos.current) return;
    const deltaX = e.clientX - startPos.current.x;
    const deltaY = e.clientY - startPos.current.y;
    setTranslate({ x: deltaX, y: deltaY });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    if (Math.abs(translate.x) > 100) {
      const direction = translate.x > 0 ? "right" : "left";
      onSwipe(direction, restaurant);
    }
    setTranslate({ x: 0, y: 0 });
    startPos.current = null;
  };

  useEffect(() => {
    if (forceSwipe) {
      const targetX = forceSwipe === "right" ? window.innerWidth : -window.innerWidth;
      setTranslate({ x: targetX, y: 0 });
      const timer = setTimeout(() => {
        onSwipe(forceSwipe, restaurant);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [forceSwipe, onSwipe, restaurant]);

  return (
    <div
      className="absolute w-full max-w-sm bg-white rounded-md shadow-lg overflow-hidden"
      style={{
        ...style,
        transform: `translate(${translate.x}px, ${translate.y}px) rotate(${translate.x / 10}deg)`,
        transition: isDragging ? "none" : "transform 0.3s ease-out",
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
        <h3 className="text-xl font-bold">{restaurant.name}</h3>
        <p className="text-gray-600">{restaurant.description}</p>
      </div>
    </div>
  );
}