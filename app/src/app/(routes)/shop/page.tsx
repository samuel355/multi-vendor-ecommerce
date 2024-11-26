"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { productsData } from "@/components/product/product-data";
import Product from "@/components/product/product";

interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  rating: number;
  maxRating: number;
  image: string;
  discount?: number;
}

export default function ProductListing() {
  const products: Product[] = [
    {
      id: "1",
      title: "Gradient Graphic T-shirt",
      price: 145,
      rating: 3.5,
      maxRating: 5,
      image: "/placeholder.svg",
    },
    {
      id: "2",
      title: "Polo with Tipping Details",
      price: 180,
      rating: 4.5,
      maxRating: 5,
      image: "/placeholder.svg",
    },
    {
      id: "3",
      title: "Black Striped T-shirt",
      price: 120,
      originalPrice: 160,
      rating: 5.0,
      maxRating: 5,
      image: "/placeholder.svg",
      discount: 30,
    },
    {
      id: "4",
      title: "Skinny Fit Jeans",
      price: 240,
      originalPrice: 260,
      rating: 3.5,
      maxRating: 5,
      image: "/placeholder.svg",
      discount: 20,
    },
    {
      id: "5",
      title: "Checkered Shirt",
      price: 180,
      rating: 4.5,
      maxRating: 5,
      image: "/placeholder.svg",
    },
    {
      id: "6",
      title: "Sleeve Striped T-shirt",
      price: 130,
      originalPrice: 160,
      rating: 4.5,
      maxRating: 5,
      image: "/placeholder.svg",
      discount: 30,
    },
    {
      id: "7",
      title: "Vertical Striped Shirt",
      price: 212,
      originalPrice: 232,
      rating: 5.0,
      maxRating: 5,
      image: "/placeholder.svg",
      discount: 20,
    },
    {
      id: "8",
      title: "Courage Graphic T-shirt",
      price: 145,
      rating: 4.0,
      maxRating: 5,
      image: "/placeholder.svg",
    },
    {
      id: "9",
      title: "Loose Fit Bermuda Shorts",
      price: 80,
      rating: 3.0,
      maxRating: 5,
      image: "/placeholder.svg",
    },
  ];

  const categories = ["T-shirts", "Shorts", "Shirts", "Hoodie", "Jeans"];

  const colors = [
    { name: "Green", class: "bg-green-500" },
    { name: "Red", class: "bg-red-500" },
    { name: "Yellow", class: "bg-yellow-500" },
    { name: "Orange", class: "bg-orange-500" },
    { name: "Blue", class: "bg-blue-500" },
    { name: "Purple", class: "bg-purple-500" },
    { name: "Pink", class: "bg-pink-500" },
    { name: "White", class: "bg-white border" },
    { name: "Black", class: "bg-black" },
  ];

  const sizes = [
    "XX-Small",
    "X-Small",
    "Small",
    "Medium",
    "Large",
    "X-Large",
    "XX-Large",
    "3X-Large",
    "4X-Large",
  ];

  const styles = ["Casual", "Formal", "Party", "Gym"];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span>Casual</span>
      </div>

      <div className="flex flex-col lg:flex-row lg:gap-8">
        {/* Mobile Filter Button */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="mb-4 lg:hidden">
              <Sliders className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <Sidebar />
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:w-64">
          <Sidebar />
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Casual</h1>
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">
                Showing 1-10 of 100 Products
              </p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    Most Popular
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Most Popular</DropdownMenuItem>
                  <DropdownMenuItem>Newest</DropdownMenuItem>
                  <DropdownMenuItem>Price: Low to High</DropdownMenuItem>
                  <DropdownMenuItem>Price: High to Low</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {productsData.map((product) => (
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

          <div className="mt-8 flex items-center justify-center gap-2">
            <Button variant="outline" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {[1, 2, 3, "...", 8, 9, 10].map((page, index) => (
              <Button
                key={index}
                variant={page === 1 ? "default" : "outline"}
                className={typeof page === "string" ? "cursor-default" : ""}
                size="icon"
              >
                {page}
              </Button>
            ))}
            <Button variant="outline" size="icon">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Sidebar() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 text-lg font-semibold">Filters</h2>
        <div className="space-y-4">
          {["T-shirts", "Shorts", "Shirts", "Hoodie", "Jeans"].map(
            (category) => (
              <div key={category} className="flex items-center">
                <Checkbox id={category.toLowerCase()} />
                <label
                  htmlFor={category.toLowerCase()}
                  className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {category}
                </label>
              </div>
            )
          )}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-sm font-semibold">Price</h3>
        <div className="space-y-4">
          <Slider
            defaultValue={[50, 200]}
            max={200}
            min={50}
            step={1}
            className="w-full"
          />
          <div className="flex items-center gap-4">
            <Input
              type="number"
              placeholder="$50"
              className="h-8"
              min={50}
              max={200}
            />
            <span>-</span>
            <Input
              type="number"
              placeholder="$200"
              className="h-8"
              min={50}
              max={200}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-sm font-semibold">Colors</h3>
        <div className="grid grid-cols-5 gap-2">
          {[
            "bg-green-500",
            "bg-red-500",
            "bg-yellow-500",
            "bg-orange-500",
            "bg-blue-500",
            "bg-purple-500",
            "bg-pink-500",
            "bg-white border",
            "bg-black",
          ].map((color, index) => (
            <button
              key={index}
              className={`h-8 w-8 rounded-full ${color} ${
                index === 7 ? "ring-2 ring-primary" : ""
              }`}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-sm font-semibold">Size</h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            "XX-Small",
            "X-Small",
            "Small",
            "Medium",
            "Large",
            "X-Large",
            "XX-Large",
            "3X-Large",
            "4X-Large",
          ].map((size) => (
            <button
              key={size}
              className={`rounded-md border px-2 py-1 text-sm ${
                size === "Large"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-sm font-semibold">Dress Style</h3>
        <div className="space-y-4">
          {["Casual", "Formal", "Party", "Gym"].map((style) => (
            <div key={style} className="flex items-center">
              <Checkbox id={style.toLowerCase()} />
              <label
                htmlFor={style.toLowerCase()}
                className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {style}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Button className="w-full">Apply Filter</Button>
    </div>
  );
}
