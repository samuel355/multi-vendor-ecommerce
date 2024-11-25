"use client"

import { Grid, List, SlidersHorizontal, Star } from 'lucide-react'
import Image from "next/image"
import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

interface Product {
  id: string
  title: string
  price: number
  originalPrice?: number
  discount?: number
  image: string
  sold?: boolean
  hot?: boolean
}

const colors = [
  { name: "Black", count: 95 },
  { name: "Blue", count: 11 },
  { name: "Brown", count: 11 },
  { name: "Gray", count: 25 },
  { name: "Green", count: 15 },
  { name: "Light Brown", count: 4 },
  { name: "Navy", count: 9 },
  { name: "Orange", count: 4 },
  { name: "Pink", count: 16 },
  { name: "Purple", count: 3 },
  { name: "Red", count: 1 },
  { name: "White", count: 34 },
  { name: "Yellow", count: 9 },
]

const vendors = [
  { name: "Amazon", count: 8 },
  { name: "Apple", count: 11 },
  { name: "Ashley", count: 3 },
  { name: "Asus", count: 4 },
  { name: "Bassett", count: 6 },
  { name: "Celexe", count: 2 },
  { name: "Clinique", count: 4 },
]

export default function ShopPage() {
  const [view, setView] = React.useState<"grid" | "list">("grid")
  const [itemsPerPage, setItemsPerPage] = React.useState("28")

  const categories = [
    "Autosport",
    "Beauty & Health",
    "Electronic",
    "Fashion",
    "Game Accessories",
    "Home & Decor",
    "Laptop & Computer",
    "Phone & Tablet",
    "TV, Audio - Video",
  ]

  const products: Product[] = [
    {
      id: "1",
      title: "Laptop Asus Vivobook i5 135u, 8GB RAM, 512GB SSD",
      price: 399,
      originalPrice: 599,
      image: "/placeholder.svg",
      discount: 33,
    },
    {
      id: "2",
      title: "Apple Watch Series 9 GPS 45mm, Aluminum Case with Sport Band",
      price: 890,
      originalPrice: 950,
      image: "/placeholder.svg",
      discount: 5,
    },
    {
      id: "3",
      title: "TOOLS 34 Low Profile Hydraulic Trolley",
      price: 767,
      originalPrice: 899,
      image: "/placeholder.svg",
      discount: 25,
    },
    // Add more products as needed
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">Shop</h1>
      <div className="flex flex-col gap-8 lg:flex-row">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="lg:hidden">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full sm:w-[340px]">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <FilterSidebar />
          </SheetContent>
        </Sheet>

        <aside className="hidden w-64 shrink-0 lg:block">
          <FilterSidebar />
        </aside>

        <main className="flex-1">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((category) => (
                <Button key={category} variant="secondary" size="sm">
                  {category}
                </Button>
              ))}
            </div>
          </div>

          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Checkbox id="sale" />
              <label htmlFor="sale" className="text-sm">
                Show only products on sale
              </label>
            </div>

            <div className="flex items-center gap-4">
              <Select value={itemsPerPage} onValueChange={setItemsPerPage}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="28">28</SelectItem>
                  <SelectItem value="56">56</SelectItem>
                  <SelectItem value="84">84</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="latest">
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Sort by latest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center rounded-md border">
                <Button
                  variant="ghost"
                  size="icon"
                  className={view === "grid" ? "bg-accent" : ""}
                  onClick={() => setView("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <Button
                  variant="ghost"
                  size="icon"
                  className={view === "list" ? "bg-accent" : ""}
                  onClick={() => setView("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div
            className={
              view === "grid"
                ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "space-y-4"
            }
          >
            {products.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-4">
                  <div className="relative aspect-square overflow-hidden rounded-lg">
                    <Image
                      src={product.image}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                    {product.discount && (
                      <Badge
                        variant="destructive"
                        className="absolute right-2 top-2"
                      >
                        -{product.discount}%
                      </Badge>
                    )}
                    {product.sold && (
                      <Badge variant="secondary" className="absolute right-2 top-2">
                        SOLD OUT
                      </Badge>
                    )}
                    {product.hot && (
                      <Badge variant="default" className="absolute right-2 top-2">
                        HOT
                      </Badge>
                    )}
                  </div>
                  <div className="mt-4">
                    <h3 className="line-clamp-2 text-sm font-medium">
                      {product.title}
                    </h3>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="font-semibold">${product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}

function FilterSidebar() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 font-semibold">Colors</h3>
        <div className="space-y-3">
          {colors.map((color) => (
            <div key={color.name} className="flex items-center gap-2">
              <Checkbox id={`color-${color.name.toLowerCase()}`} />
              <label
                htmlFor={`color-${color.name.toLowerCase()}`}
                className="flex flex-1 items-center justify-between text-sm"
              >
                {color.name}
                <span className="text-muted-foreground">({color.count})</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-4 font-semibold">vendors</h3>
        <div className="mb-4">
          <Input placeholder="Search vendors..." />
        </div>
        <div className="space-y-3">
          {vendors.map((brand) => (
            <div key={brand.name} className="flex items-center gap-2">
              <Checkbox id={`brand-${brand.name.toLowerCase()}`} />
              <label
                htmlFor={`brand-${brand.name.toLowerCase()}`}
                className="flex flex-1 items-center justify-between text-sm"
              >
                {brand.name}
                <span className="text-muted-foreground">({brand.count})</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-4 font-semibold">Price</h3>
        <div className="space-y-3">
          {["$0 - $100", "$100 - $200", "$200 - $500", "$500+"].map((range) => (
            <div key={range} className="flex items-center gap-2">
              <Checkbox id={`price-${range}`} />
              <label htmlFor={`price-${range}`} className="text-sm">
                {range}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-4 font-semibold">Customer Rating</h3>
        <div className="space-y-3">
          {[5, 4, 3, 2].map((rating) => (
            <div key={rating} className="flex items-center gap-2">
              <Checkbox id={`rating-${rating}`} />
              <label
                htmlFor={`rating-${rating}`}
                className="flex items-center gap-1 text-sm"
              >
                {Array.from({ length: rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-primary text-primary"
                  />
                ))}
                {Array.from({ length: 5 - rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-muted" />
                ))}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button className="flex-1">Apply Filters</Button>
        <Button variant="outline">Reset</Button>
      </div>
    </div>
  )
}

