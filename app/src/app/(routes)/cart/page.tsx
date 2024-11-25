import NewsLetter from "@/components/news-letter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface CartItem {
  id: string;
  name: string;
  size: string;
  color: string;
  price: number;
  image: string;
  quantity: number;
}

const Cart = () => {
  const cartItems: CartItem[] = [
    {
      id: "1",
      name: "Gradient Graphic T-shirt",
      size: "Large",
      color: "White",
      price: 145,
      image: "/placeholder.svg",
      quantity: 1,
    },
    {
      id: "2",
      name: "Checkered Shirt",
      size: "Medium",
      color: "Red",
      price: 180,
      image: "/placeholder.svg",
      quantity: 1,
    },
    {
      id: "3",
      name: "Skinny Fit Jeans",
      size: "Large",
      color: "Blue",
      price: 240,
      image: "/placeholder.svg",
      quantity: 1,
    },
  ];

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const discount = subtotal * 0.2;
  const deliveryFee = 15;
  const total = subtotal - discount + deliveryFee;

  return (
    <div className="mx-10 py-8">
      <div className="mb-8">
        <nav className="flex text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span>Cart</span>
        </nav>
      </div>

      <h1 className="text-4xl font-bold mb-8">YOUR CART</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="flex items-start gap-4 p-4">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={100}
                    height={100}
                    className="rounded-md object-cover"
                  />
                  <div className="flex-1 space-y-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <div className="text-sm text-muted-foreground">
                      Size: {item.size}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Color: {item.color}
                    </div>
                    <div className="font-semibold">${item.price}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon">
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button variant="outline" size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal}</span>
                </div>
                <div className="flex justify-between text-destructive">
                  <span>Discount (-20%)</span>
                  <span>-${discount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>${deliveryFee}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${total}</span>
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Add promo code" />
                  <Button variant="outline">Apply</Button>
                </div>
                <Button className="w-full" size="lg">
                  Go to Checkout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <NewsLetter />
    </div>
  );
};

export default Cart;
