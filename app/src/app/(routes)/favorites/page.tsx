"use client";
import CartItem from "@/components/cart-item";
import FavoriteItem from "@/components/favorite-item";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/store/useStore";
import { ProductProps } from "@/types/product";
import Link from "next/link";
import React, { FC, useMemo, useState } from "react";

const Cart: FC<ProductProps> = () => {
  const { items, favorites, getTotal } = useCart();

  const [promoCode, setPromoCode] = useState(""); // For user-entered promo code
  const [discountPercent, setDiscountPercent] = useState<number | null>(null); // Discount percentage (null means no valid discount)

  // Predefined promo codes with discount percentages
  const validPromoCodes: Record<string, number> = {
    SAVE10: 10, // 10% discount
    SAVE20: 20, // 20% discount
    WELCOME5: 5, // 5% discount
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
  const total = useMemo(
    () => subtotal - discountAmount + DELIVERY_FEE,
    [subtotal, discountAmount]
  );

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
            <span>Favorites</span>
          </nav>
        </div>

        {items.length > 0 ? (
          <>
            <h1 className="text-4xl font-bold mb-8">YOUR FAVORITES</h1>

            {/* <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
              <div className="space-y-4 max-h-[48rem] overflow-y-scroll">
                {favorites.map((item) => (
                  <FavoriteItem
                    key={item.id}
                    id={item.id}
                    image={item.image}
                    title={item.title}
                    size={item.size}
                    color={item.color}
                    price={item.price}
                    dropdown={false}
                  />
                ))}
              </div>
            </div> */}

            <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
              {favorites.map((favorite) => (
                <FavoriteItem
                  key={favorite.id}
                  id={favorite.id}
                  image={favorite.image}
                  title={favorite.title}
                  size={favorite.size}
                  color={favorite.color}
                  price={favorite.price}
                  dropdown={false}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center">
            <h4 className="p-3 border rounded">
              You don't have any favorite product{" "}
              <Link href={"/"}> Visit Shop</Link> to Add Products to favorites
            </h4>
          </div>
        )}
      </div>
    </>
  );
};

export default Cart;
