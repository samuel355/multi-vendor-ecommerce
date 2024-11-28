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
import { useEffect, useState, useRef } from "react";
import { productsData } from "./product/product-data";
import Link from "next/link";
import Image from "next/image";

export default function FlashSale() {
  const [time, setTime] = useState({
    hours: 19,
    minutes: 2,
    seconds: 53,
  });

  // Countdown timer logic
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
    <div className="w-full px-10">
      <div className="flex justify-between items-center mb-8 ">
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
          <Link href="/shop" className="underline">
            See All Products
          </Link>
        </div>
      </div>

      <Carousel className="w-full">
        <CarouselContent className="-ml-2 md:-ml-4">
          {productsData.map((product, index) => (
            <CarouselItem
              key={product.id}
              className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/4"
            >
              <Card className="shadow group">
                <CardContent className="p-0">
                  <div className="relative">
                    <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-sm rounded">
                      -{product.discount}%
                    </span>
                    <Link href={`/product-details/${product.id}`}>
                    <Image
                      src={product.image}
                      alt={product.title}
                      width={100}
                      height={100}
                      className="w-full h-[300px] object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                    /></Link>
                  </div>
                  <div className="mt-4 space-y-2 p-4">
                    <Link href={`/product-details/${product.id}`}><h3 className="font-medium text-sm line-clamp-2">
                      {product.title}
                    </h3></Link>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold">
                        ${product.price}
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
