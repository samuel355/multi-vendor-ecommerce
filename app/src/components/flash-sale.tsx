"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";

interface Product {
  id: number;
  name: string;
  discount: number;
  originalPrice: number;
  currentPrice: number;
  rating: number;
  image: string;
}

const products: Product[] = [
  {
    id: 1,
    name: "Make Up For Ever Water Blend Face & Body Foundation",
    discount: 11,
    originalPrice: 47,
    currentPrice: 42,
    rating: 0,
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 2,
    name: "Translucent Compact Face Powder - 03 Medium, 0.22 oz",
    discount: 37,
    originalPrice: 14,
    currentPrice: 9,
    rating: 3.5,
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 3,
    name: "Allure Luminous Intense Lipstick 0.15oz",
    discount: 17,
    originalPrice: 24,
    currentPrice: 20,
    rating: 5,
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 4,
    name: "Makeup Brushes Artisan Easel Elite Cosmetics",
    discount: 37,
    originalPrice: 30,
    currentPrice: 19,
    rating: 5,
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 5,
    name: "Makeup Magic Skin Beautifier BB Cream Tinted Moisturizer",
    discount: 24,
    originalPrice: 46,
    currentPrice: 35,
    rating: 5,
    image: "/placeholder.svg?height=300&width=300",
  },
];

export default function FlashSale() {
  const [time, setTime] = useState({
    hours: 19,
    minutes: 2,
    seconds: 53,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime.seconds > 0) {
          return { ...prevTime, seconds: prevTime.seconds - 1 };
        } else if (prevTime.minutes > 0) {
          return { ...prevTime, minutes: prevTime.minutes - 1, seconds: 59 };
        } else if (prevTime.hours > 0) {
          return { hours: prevTime.hours - 1, minutes: 59, seconds: 59 };
        }
        return prevTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating
            ? "text-yellow-400 fill-yellow-400"
            : "text-gray-300 fill-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Flash Deals</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Ends in</span>
            <div className="flex items-center gap-1">
              <span className="bg-black text-white px-2 py-1 rounded">
                {String(time.hours).padStart(2, "0")}
              </span>
              <span className="text-xl">:</span>
              <span className="bg-black text-white px-2 py-1 rounded">
                {String(time.minutes).padStart(2, "0")}
              </span>
              <span className="text-xl">:</span>
              <span className="bg-black text-white px-2 py-1 rounded">
                {String(time.seconds).padStart(2, "0")}
              </span>
            </div>
          </div>
          <a href="#" className="text-black underline">
            See All Products
          </a>
        </div>
      </div>

      <Carousel className="w-full">
        <CarouselContent className="-ml-2 md:-ml-4">
          {products.map((product, index) => (
            <CarouselItem
              key={index}
              className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/4"
            >
              <Card className="border-0 shadow-none">
                <CardContent className="p-0">
                  <div className="relative">
                    <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-sm rounded">
                      -{product.discount}%
                    </span>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-[300px] object-cover rounded-lg"
                    />
                  </div>
                  <div className="mt-4 space-y-2">
                    <h3 className="font-medium text-sm line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold">
                        ${product.currentPrice}
                      </span>
                      <span className="text-gray-400 line-through">
                        ${product.originalPrice}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {renderStars(product.rating)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0" />
        <CarouselNext className="right-0" />
      </Carousel>
    </div>
  );
}
