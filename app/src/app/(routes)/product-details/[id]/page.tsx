"use client";

import { Loader, Minus, MoreHorizontal, Plus, Star } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { productsData } from "@/components/product/product-data";
import { useRouter } from "next/navigation";
import { ProductProps } from "@/types/product";
import { useCart } from "@/store/useStore";
import { toast } from "sonner";

interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  content: string;
  verified: boolean;
}

export default function ProductDetail() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("Large");
  const [selectedColor, setSelectedColor] = useState(0);
  const [product, setProduct] = useState<ProductProps | null>(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const router = useRouter();

  const { isInCart, addItem, updateQuantity } = useCart();

  const images = [
    "/products/black-shade.jpg",
    "/products/macbook-new.jpg",
    "/products/sneaker.jpg",
  ];

  const colors = [
    { name: "Olive", class: "bg-[#5A5B40]" },
    { name: "Forest", class: "bg-[#2F4F4F]" },
    { name: "Navy", class: "bg-[#1B1B3A]" },
  ];

  const sizes = ["Small", "Medium", "Large", "X-Large"];

  const reviews: Review[] = [
    {
      id: "1",
      author: "Samantha D.",
      rating: 4.5,
      date: "August 14, 2023",
      content:
        "I absolutely love this t-shirt! The design is unique and the fabric feels so comfortable. As a fellow designer, I appreciate the attention to detail. It's become my favorite go-to shirt!",
      verified: true,
    },
    {
      id: "2",
      author: "Alex M.",
      rating: 4,
      date: "August 15, 2023",
      content:
        "The t-shirt exceeded my expectations! The colors are vibrant and the print quality is top-notch. Being a UI/UX designer myself, I'm quite picky about aesthetics, and this t-shirt definitely gets a thumbs up from me.",
      verified: true,
    },
    {
      id: "3",
      author: "Ethan R.",
      rating: 4.5,
      date: "August 16, 2023",
      content:
        "This t-shirt is a must-have for anyone who appreciates good design. The minimalistic yet stylish pattern caught my eye, and the fit is perfect. I can see the designer's touch in every aspect of this shirt.",
      verified: true,
    },
    {
      id: "4",
      author: "Olivia P.",
      rating: 4,
      date: "August 17, 2023",
      content:
        "As a UI/UX enthusiast, I value simplicity and functionality. This t-shirt not only represents those principles but also feels great to wear. It's evident that the designer poured their creativity into making this t-shirt stand out.",
      verified: true,
    },
    {
      id: "5",
      author: "Liam K.",
      rating: 4,
      date: "August 18, 2023",
      content:
        "This t-shirt is a fusion of comfort and creativity. The fabric is soft, and the design speaks volumes about the designer's skill. It's like wearing a piece of art that reflects my passion for both design and fashion.",
      verified: true,
    },
    {
      id: "6",
      author: "Ava H.",
      rating: 4.5,
      date: "August 19, 2023",
      content:
        "I'm not just wearing a t-shirt; I'm wearing a piece of design philosophy. The intricate details and thoughtful layout of the design make this shirt a conversation starter.",
      verified: true,
    },
  ];

  useEffect(() => {
    if (id) {
      const foundProduct = productsData.find((product) => product.id === id);
      if (foundProduct) {
        setProduct(foundProduct);
        setLoading(false);
      } else {
        router.back();
      }
    }
  }, [id, productsData, router]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center my-16">
        <Loader className="animate-spin" />
      </div>
    );
  }

  // Handle cart operations
  const handleCartAction = () => {
    if (!product) return;
    if (!id) return;

    if (isInCart(id.toString())) {
      updateQuantity(id.toString(), quantity);
      toast("Product Added");
    } else {
      addItem(product, quantity);
      toast.success("Added to cart");
    }
  };

  return (
    <>
      <div className="mx-10 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex flex-col gap-3">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-20 w-20 overflow-hidden rounded-lg border ${
                      selectedImage === index ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`Product thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
              <div className="relative aspect-square flex-1 overflow-hidden rounded-lg bg-muted">
                <Image
                  src={images[selectedImage]}
                  alt="Product image"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">
                {product?.title}
              </h1>

              <div className="mt-2 flex items-center gap-1">
                {[...Array(5)].map((_, i) => {
                  const isFullStar = i < Math.floor(product?.rating ?? 4.5);
                  const isHalfStar =
                    product?.rating !== undefined &&
                    i === Math.floor(product?.rating) &&
                    product?.rating % 1 !== 0;

                  return (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        isFullStar
                          ? "fill-primary text-primary"
                          : isHalfStar
                          ? "fill-primary/50 text-primary"
                          : "fill-muted text-muted"
                      }`}
                    />
                  );
                })}
                <span className="ml-1 text-sm text-muted-foreground">
                  {product?.rating}/{5}
                </span>
              </div>
            </div>

            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-bold">$260</span>
              <span className="text-xl text-muted-foreground line-through">
                $300
              </span>
              <span className="rounded-md bg-red-50 px-2 py-1 text-sm font-semibold text-red-500">
                -40%
              </span>
            </div>

            <p className="text-muted-foreground">
              This graphic t-shirt which is perfect for any occasion. Crafted
              from a soft and breathable fabric, it offers superior comfort and
              style.
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-sm font-medium">Select Colors</h3>
                <div className="flex gap-2">
                  {colors.map((color, index) => (
                    <button
                      key={index}
                      className={`h-8 w-8 rounded-full ${color.class} ${
                        selectedColor === index
                          ? "ring-2 ring-primary ring-offset-2"
                          : ""
                      }`}
                      onClick={() => setSelectedColor(index)}
                      aria-label={`Select ${color.name} color`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-medium">Choose Size</h3>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      className={`rounded-full px-6 py-2 text-sm ${
                        selectedSize === size
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center rounded-full bg-muted">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  onClick={handleCartAction}
                  className="flex-1 rounded-full"
                  size="lg"
                >
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="reviews" className="mt-12">
          <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0">
            <TabsTrigger
              value="details"
              className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary"
            >
              Product Details
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary"
            >
              Rating & Reviews
            </TabsTrigger>
            <TabsTrigger
              value="faqs"
              className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary"
            >
              FAQs
            </TabsTrigger>
          </TabsList>
          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  All Reviews{" "}
                  <span className="text-muted-foreground">(451)</span>
                </h2>
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm" className="rounded-full">
                    Latest
                  </Button>
                  <Button variant="default" size="sm" className="rounded-full">
                    Write a Review
                  </Button>
                </div>
              </div>
              <div className="grid gap-6">
                {reviews.map((review) => (
                  <div key={review.id} className="space-y-2">
                    <div className="flex items-center justify-between">
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
                          <span className="text-sm text-green-500">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">More options</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Report Review</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
      </div>
    </>
  );
}
