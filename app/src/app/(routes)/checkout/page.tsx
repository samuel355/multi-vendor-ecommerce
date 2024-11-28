import CartItem from "@/components/cart-item";
import NewsLetter from "@/components/news-letter";
import Footer from "@/components/shared/footer";
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
    <>
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
                <CartItem
                  id={item.id}
                  image={item.image}
                  title={item.name}
                  size={item.size}
                  color={item.color}
                  price={item.price}
                  quantity={item.quantity}
                />
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

      <Footer />
    </>
  );
};

export default Cart;
