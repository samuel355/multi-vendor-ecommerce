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
import { useCart } from "@/store/useStore";
import FavoriteItem from "../favorite-item";

interface Props {
  open: boolean;
  setOpen: (isOpen: boolean) => void;
}

const FavoriteProducts: FC<Props> = ({ open, setOpen }) => {
  const {favorites, clearFavorites} = useCart();
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button aria-label="Toggle menu"></button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64 mt-2 mr-2">
      <div className="space-y-2 max-h-72 overflow-y-scroll">
          {favorites.map((item) => (
            <FavoriteItem
              id={item.id}
              image={item.image}
              title={item.title}
              size={item.size}
              color={item.color}
              price={item.price}
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
