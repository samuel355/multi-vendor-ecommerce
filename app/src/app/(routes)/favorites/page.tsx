"use client";
import CartItem from "@/components/cart-item";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/store/useStore";
import { ProductProps } from "@/types/product";
import Link from "next/link";
import React, { FC, useMemo, useState } from "react";

const Cart: FC<ProductProps> = () => {
  const { items, getTotal } = useCart();

  const [promoCode, setPromoCode] = useState(""); // For user-entered promo code
  const [discountPercent, setDiscountPercent] = useState<number | null>(null); // Discount percentage (null means no valid discount)

  // Predefined promo codes with discount percentages
  const validPromoCodes: Record<string, number> = {
    "SAVE10": 10, // 10% discount
    "SAVE20": 20, // 20% discount
    "WELCOME5": 5, // 5% discount
  };

  // Constants for delivery fee
  const DELIVERY_FEE = 5; // Flat delivery fee

  // Calculate the subtotal
  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [items]
  );

  // Calculate the discount based on the total
  const discountAmount = useMemo(() => {
    if (discountPercent) {
      return (subtotal * discountPercent) / 100;
    }
    return 0;
  }, [subtotal, discountPercent]);

  // Calculate the final total
  const total = useMemo(() => subtotal - discountAmount + DELIVERY_FEE, [
    subtotal,
    discountAmount,
  ]);

  // Handle promo code validation
  const applyPromoCode = () => {
    const discount = validPromoCodes[promoCode.toUpperCase()];
    if (discount) {
      setDiscountPercent(discount);
    } else {
      setDiscountPercent(null);
      alert("Invalid promo code. Please try again.");
    }
  };

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

        {items.length > 0 ? (
          <>
            <h1 className="text-4xl font-bold mb-8">YOUR CART</h1>

            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="space-y-4 max-h-[48rem] overflow-y-scroll">
                  {items.map((item) => (
                    <CartItem
                      key={item.id}
                      id={item.id}
                      image={item.image}
                      title={item.title}
                      size={item.size}
                      color={item.color}
                      price={item.price}
                      quantity={item.quantity}
                      dropdown={false}
                    />
                  ))}
                </div>
              </div>

              {/* Cart Summary */}
              <div>
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">
                      Order Summary
                    </h2>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      {discountPercent && (
                        <div className="flex justify-between text-destructive">
                          <span>Discount ({discountPercent}%)</span>
                          <span>-${discountAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Delivery Fee</span>
                        <span>${DELIVERY_FEE.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add promo code"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                        />
                        <Button onClick={applyPromoCode} variant="outline">
                          Apply
                        </Button>
                      </div>
                      <Button className="w-full" size="lg">
                        Proceed to payment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center">
            <h4 className="p-3 border rounded">
              Your cart is empty. Visit <Link href={"/"}>Shop</Link> Add
              Products to cart
            </h4>
          </div>
        )}
      </div>
    </>
  );
};

export default Cart;
