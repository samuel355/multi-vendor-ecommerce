"use client"

import { Heart, ShoppingCart } from 'lucide-react'
import Image from "next/image"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

interface Product {
  id: string
  title: string
  price: number
  originalPrice?: number
  image: string
  hot?: boolean
  discount?: number
}

export default function NewArrivals() {
  const discounts = [10, 20, 30, 40, 50]

  const products: Product[] = [
    {
      id: "1",
      title: "Milo Brass And Black Metal Lamp Ø18cm x 30cm",
      price: 82,
      image: "/placeholder.svg",
      hot: true,
    },
    {
      id: "2",
      title: "Light Luxury Urban Leather Lounge Chair Home Living Room",
      price: 179,
      image: "/placeholder.svg",
    },
    {
      id: "3",
      title: "Howard Chandelier Six Long Arms – Gunmetal",
      price: 745,
      image: "/placeholder.svg",
    },
    {
      id: "4",
      title: "14-inch Fasion Simplicity Quality Wall Clock, Home Decor",
      price: 50,
      originalPrice: 75,
      image: "/placeholder.svg",
      discount: 33,
    },
    {
      id: "5",
      title: "Drawer Record Storage Cabinet Turntable Stand",
      price: 108,
      image: "/placeholder.svg",
    },
    {
      id: "6",
      title: "Solid Wood Rattan Tv Unit – Natural Finish",
      price: 178,
      image: "/placeholder.svg",
    },
  ]

  return (
    <div className="space-y-12">
      {/* Discount Banner */}
      <div className="flex justify-center gap-4 overflow-x-auto py-8">
        {discounts.map((discount) => (
          <div
            key={discount}
            className={`flex h-24 w-24 items-center justify-center rounded-full border-2 border-primary ${
              discount === 50 ? "bg-primary text-primary-foreground" : ""
            }`}
          >
            <div className="text-center">
              <div className="text-xl font-bold">+{discount}%</div>
              <div className="text-sm">OFF</div>
            </div>
          </div>
        ))}
      </div>

      {/* New Arrivals Section */}
      <div>
        <h2 className="mb-8 text-center text-3xl font-bold">New Arrivals</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id} className="group relative overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-square">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute right-2 top-2 flex flex-col gap-2">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                    >
                      <Heart className="h-4 w-4" />
                      <span className="sr-only">Add to wishlist</span>
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span className="sr-only">Add to cart</span>
                    </Button>
                  </div>
                  {product.hot && (
                    <Badge
                      variant="destructive"
                      className="absolute left-2 top-2"
                    >
                      HOT
                    </Badge>
                  )}
                  {product.discount && (
                    <Badge
                      variant="destructive"
                      className="absolute left-2 top-2"
                    >
                      -{product.discount}%
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-start gap-2 p-4">
                <Link href="#" className="line-clamp-2 hover:underline">
                  {product.title}
                </Link>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold">${product.price}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      ${product.originalPrice}
                    </span>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

