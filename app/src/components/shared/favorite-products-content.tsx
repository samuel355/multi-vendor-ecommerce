import React, { FC } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { CartItemProps } from "@/types/cart";
import CartItem from "../cart-item";
import Link from "next/link";

interface Props {
  open: boolean;
  setOpen: (isOpen: boolean) => void;
}

const FavoriteProducts: FC<Props> = ({ open, setOpen }) => {
  const cartItems: CartItemProps[] = [
    {
      id: "1",
      name: "Gradient Graphic T-shirt",
      size: "Large",
      color: "White",
      price: 145,
      image: "/products/black-shade.jpg",
      quantity: 1,
    },
    {
      id: "2",
      name: "Checkered Shirt",
      size: "Medium",
      color: "Red",
      price: 180,
      image: "/products/macbook-new.jpg",
      quantity: 1,
    },
    {
      id: "3",
      name: "Skinny Fit Jeans",
      size: "Large",
      color: "Blue",
      price: 240,
      image: "/products/sneaker.jpg",
      quantity: 1,
    },
  ];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button aria-label="Toggle menu"></button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64 mt-2 mr-2">
      <div className="space-y-2 max-h-72 overflow-y-scroll">
          {cartItems.map((item) => (
            <CartItem
              id={item.id}
              image={item.image}
              title={item.name}
              size={item.size}
              color={item.color}
              price={item.price}
              quantity={item.quantity}
              dropdown={true}
            />
          ))}
        </div>
        
        <div className="flex justify-end px-2 mt-4 mb-2 border-t">
          <Link className="text-sm hover:underline mt-2" href={'/favorite-products'}>View Favorites</Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FavoriteProducts;
