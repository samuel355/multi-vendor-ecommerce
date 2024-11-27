"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { productsData } from "./product/product-data";
import Product from "./product/product";

export default function RelatedProducts() {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === productsData.length - 4 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? productsData.length - 4 : prevIndex - 1
    );
  };

  return (
    <div className="w-full">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Related products</h2>
      </div>
      <div className="relative">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{
              transform: `translateX(-${currentIndex * 25}%)`,
            }}
          >
            {productsData.slice(0, 8).map((product) => (
              <Product
                id={product.id}
                image={product.image}
                hot={product.hot}
                discount={product.discount}
                title={product.title}
                price={product.price}
                originalPrice={product.originalPrice}
                rating={product.rating}
              />
            ))}
          </div>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="absolute -left-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full"
          onClick={prevSlide}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous slide</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="absolute -right-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full"
          onClick={nextSlide}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next slide</span>
        </Button>
      </div>
    </div>
  );
}
