import React, { FC } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { CartItemProps } from "@/types/cart";
import CartItem from "../cart-item";
import Link from "next/link";
import { useCart } from "@/store/useStore";

interface Props {
  open: boolean;
  setOpen: (isOpen: boolean) => void;
}

const CartContent: FC<Props> = ({ open, setOpen }) => {
  const { clearCart, items } = useCart();

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button aria-label="Toggle menu"></button>
      </DropdownMenuTrigger>

      {items.length <= 0 ? (
        <DropdownMenuContent className="flex justify-center items-center p-2 border-t border-gray-200">
          <small>Your cart is empty</small>
        </DropdownMenuContent>
      ) : (
        <>
          <DropdownMenuContent className="w-72 mt-2 mr-2">
            <div className="space-y-2 max-h-72 overflow-y-scroll">
              {items.map((item) => (
                <CartItem
                  id={item.id}
                  image={item.image}
                  title={item.title}
                  size={item.size}
                  color={item.color}
                  price={item.price}
                  quantity={item.quantity}
                  dropdown={true}
                />
              ))}
            </div>

            <div className="flex justify-between items-center p-2 border-t border-gray-200">
              <small
                onClick={() => {
                  clearCart();
                  setOpen(false);
                }}
                className="cursor-pointer"
              >
                Clear Cart
              </small>
              <Link className="text-sm hover:underline mt-2" href={"/checkout"}>
                View Cart
              </Link>
            </div>
          </DropdownMenuContent>
        </>
      )}
    </DropdownMenu>
  );
};

export default CartContent;
