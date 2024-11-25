"use client"

import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from "next/image"
import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card"

interface Product {
  id: string
  title: string
  price: number
  image: string
  hot?: boolean
}

export default function RelatedProducts() {
  const [currentIndex, setCurrentIndex] = React.useState(0)

  const products: Product[] = [
    {
      id: "1",
      title: "Gaming Laptop 16\" FHD 165Hz, GeForce RTX 4070",
      price: 1922,
      image: "/placeholder.svg",
    },
    {
      id: "2",
      title: "Apple MacBook Air with Apple M1 Chip,13.3 inch, 8GB RAM",
      price: 610,
      image: "/placeholder.svg",
    },
    {
      id: "3",
      title: "Digital Camera 42X Optical Zoom 24mm Wide Angle",
      price: 187,
      image: "/placeholder.svg",
    },
    {
      id: "4",
      title: "42-Inch Class OLED Evo 4K Processor Smart TV",
      price: 536,
      image: "/placeholder.svg",
    },
    {
      id: "5",
      title: "Exide Mileage 35Ah Car Battery 60 Months Warranty",
      price: 55,
      image: "/placeholder.svg",
      hot: true,
    },
  ]

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === products.length - 4 ? 0 : prevIndex + 1
    )
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? products.length - 4 : prevIndex - 1
    )
  }

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
            {products.map((product) => (
              <div
                key={product.id}
                className="w-full min-w-[25%] px-2"
              >
                <Card className="border-0 shadow-none">
                  <CardContent className="p-0">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                      <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        className="object-cover"
                      />
                      {product.hot && (
                        <Badge
                          variant="destructive"
                          className="absolute right-2 top-2"
                        >
                          HOT
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col items-start p-4">
                    <h3 className="line-clamp-2 text-sm font-medium">
                      {product.title}
                    </h3>
                    <p className="mt-2 font-semibold">
                      ${product.price}
                    </p>
                  </CardFooter>
                </Card>
              </div>
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
  )
}

