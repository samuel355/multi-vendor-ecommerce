"use client";
import FavoriteItem from "@/components/favorite-item";
import { useCart } from "@/store/useStore";
import { ProductProps } from "@/types/product";
import Link from "next/link";
import React, { FC} from "react";

const Cart: FC<ProductProps> = () => {
  const {favorites} = useCart();

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

        {favorites.length > 0 ? (
          <>
            <h1 className="text-4xl font-bold mb-8">YOUR FAVORITES</h1>

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
