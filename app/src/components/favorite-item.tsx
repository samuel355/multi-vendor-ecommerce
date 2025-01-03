"use client";
import { FC } from "react";
import { Card, CardContent } from "./ui/card";
import Image from "next/image";
import { Button } from "./ui/button";
import {Plus, Trash2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCart } from "@/store/useStore";
import { ProductProps } from "@/types/product";
import { toast } from "sonner";

interface CartProps extends ProductProps {
  quantity?: number;
  dropdown: boolean;
}

const FavoriteItem: FC<CartProps> = ({
  id,
  image,
  title,
  price,
  dropdown = false,
}: CartProps) => {
  const pathname = usePathname();
  const {removeFromFavorites, moveToCart} = useCart()

  const handleMoveToCart = () => {
    moveToCart(id);
    toast.success('Product moved to cart')
  }

  return (
    <Card key={id}>
      <CardContent className="flex flex-col md:flex-row items-start gap-4 p-4">
        <Image
          src={image}
          alt={title}
          width={dropdown ? 60 : 100}
          height={dropdown ? 60 : 100}
          className="rounded-md object-cover"
        />
        <div className="flex-1 space-y-1">
          {dropdown !== true ? (
            <>
              <h3 className="font-semibold">{title}</h3>
            </>
          ) : (
            <>
              <small>{title}</small>
            </>
          )}
          <div className="font-semibold">${price}</div>
        </div>
        <div className="flex flex-col justify-between gap-8">
          <div className="flex items-center gap-4">
            {dropdown !== true && (
              <div className="flex items-center gap-2">
                <Button onClick={handleMoveToCart} variant="outline" size="sm">
                  <Plus className="h-4 w-4" />
                  Move to Cart
                </Button>
              </div>
            )}
            <Button onClick={() => removeFromFavorites(id)} variant="outline" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          {dropdown === false && (
            <div
              className="w-full flex justify-end"
              style={{
                display: pathname === '/favorite-products'
                  ? "block"
                  : "none",
              }}
            >
              <Button>Add to Cart</Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FavoriteItem;
