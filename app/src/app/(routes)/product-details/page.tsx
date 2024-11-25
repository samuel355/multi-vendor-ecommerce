"use client";

import { Minus, Plus, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NewsLetter from "@/components/news-letter";

interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  content: string;
  verified: boolean;
}

interface ProductDtailsProps {}

const ProductDetails: React.FC<ProductDtailsProps> = () => {
  const [selectedImage, setSelectedImage] = React.useState(0);
  const [quantity, setQuantity] = React.useState(1);

  const images = ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"];

  const reviews: Review[] = [
    {
      id: "1",
      author: "Samantha D.",
      rating: 5,
      date: "August 14, 2023",
      content:
        "Love how soft this fabric is! The design is unique and the fabric feels so comfortable. As a fellow designer, I appreciate the attention to detail. It's become my favorite go-to shirt!",
      verified: true,
    },
    {
      id: "2",
      author: "Alex M.",
      rating: 4,
      date: "August 15, 2023",
      content:
        "Really impressed with the construction! The colors are vibrant and the print quality is top-notch. Being a UNISEX design myself, I'm quite picky about aesthetics, and this shirt definitely gets a thumbs up from me.",
      verified: true,
    },
  ];

  const relatedProducts = [
    {
      id: "1",
      name: "Polo with Contrast Trim",
      price: 212,
      originalPrice: 242,
      rating: 4.5,
      image: "/placeholder.svg",
    },
    {
      id: "2",
      name: "Gradient Graphic T-shirt",
      price: 145,
      originalPrice: 145,
      rating: 4.0,
      image: "/placeholder.svg",
    },
    {
      id: "3",
      name: "Polo with Tipping Details",
      price: 180,
      originalPrice: 180,
      rating: 4.5,
      image: "/placeholder.svg",
    },
    {
      id: "4",
      name: "Black Striped T-shirt",
      price: 120,
      originalPrice: 160,
      rating: 4.0,
      image: "/placeholder.svg",
    },
  ];

  return (
    <div className="mx-10 py-8">
      <nav className="flex items-center text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/shop" className="hover:text-primary">
          Shop
        </Link>
        <span className="mx-2">/</span>
        <span>T-shirts</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg border">
            <Image
              src={images[selectedImage]}
              alt="Product image"
              width={600}
              height={600}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex gap-4">
            {images.map((image, index) => (
              <button
                key={index}
                className={`relative aspect-square w-20 overflow-hidden rounded-lg border ${
                  selectedImage === index ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedImage(index)}
              >
                <Image
                  src={image}
                  alt={`Product image ${index + 1}`}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">ONE LIFE GRAPHIC T-SHIRT</h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < 4 ? "fill-primary text-primary" : "text-muted"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">(4.5)</span>
            </div>
          </div>

          <div className="flex items-baseline gap-4">
            <span className="text-3xl font-bold">$260</span>
            <span className="text-xl text-muted-foreground line-through">
              $300
            </span>
            <span className="text-sm font-semibold text-red-500">-48%</span>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Select Color</h3>
              <div className="flex gap-2">
                {["bg-olive-600", "bg-slate-800", "bg-navy-600"].map(
                  (color, index) => (
                    <button
                      key={index}
                      className={`h-8 w-8 rounded-full ${color} ${
                        index === 0 ? "ring-2 ring-primary ring-offset-2" : ""
                      }`}
                      aria-label={`Select color ${index + 1}`}
                    />
                  )
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Choose Size</h3>
              <Select defaultValue="large">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                  <SelectItem value="xlarge">X-Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button className="flex-1" size="lg">
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="reviews" className="mt-12">
        <TabsList>
          <TabsTrigger value="details">Product Details</TabsTrigger>
          <TabsTrigger value="reviews">Rating & Reviews</TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
        </TabsList>
        <TabsContent value="reviews" className="mt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">All Reviews</h2>
              <Button variant="outline">Write a Review</Button>
            </div>
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "fill-primary text-primary"
                              : "text-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-medium">{review.author}</span>
                    {review.verified && (
                      <span className="text-sm text-green-500">✓ Verified</span>
                    )}
                  </div>
                  <p className="text-muted-foreground">{review.content}</p>
                  <p className="text-sm text-muted-foreground">
                    Posted on {review.date}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-8">YOU MIGHT ALSO LIKE</h2>
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {relatedProducts.map((product) => (
            <Card key={product.id}>
              <CardContent className="p-4">
                <div className="aspect-square overflow-hidden rounded-lg">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={300}
                    height={300}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="mt-4">
                  <h3 className="font-medium">{product.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < product.rating
                              ? "fill-primary text-primary"
                              : "text-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({product.rating})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-medium">${product.price}</span>
                    {product.originalPrice > product.price && (
                      <>
                        <span className="text-sm text-muted-foreground line-through">
                          ${product.originalPrice}
                        </span>
                        <span className="text-sm text-red-500">
                          -
                          {Math.round(
                            ((product.originalPrice - product.price) /
                              product.originalPrice) *
                              100
                          )}
                          %
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <NewsLetter />
    </div>
  );
};

export default ProductDetails;
