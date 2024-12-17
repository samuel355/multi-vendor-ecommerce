"use client";
import { FC, useState } from "react";
import { Card, CardContent } from "./ui/card";
import Image from "next/image";
import { Button } from "./ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCart } from "@/store/useStore";
import { ProductProps } from "@/types/product";
import { toast } from "sonner";

interface CartProps extends ProductProps {
  quantity?: number;
  dropdown: boolean;
}

const CartItem: FC<CartProps> = ({
  id,
  image,
  title,
  size,
  color,
  price,
  quantity,
  dropdown = false,
}: CartProps) => {
  const pathname = usePathname();
  const { items, updateQuantity, removeItem, getTotal, getSubtotal, discount, setDiscount } = useCart();
  const [discountInput, setDiscountInput] = useState<string>("");

  const increaseQty = (id: string) => {
    const currentItem = items.find((item) => item.id === id);
    if (currentItem) {
      updateQuantity(id, currentItem.quantity + 1);
    }
  };

  const decreaseQty = (id: string) => {
    const currentItem = items.find((item) => item.id === id);
    if (currentItem && currentItem.quantity > 1) {
      updateQuantity(id, currentItem.quantity - 1);
    }
  };

  const applyDiscount = () => {
    const discountValue = parseFloat(discountInput);
    if (!isNaN(discountValue) && discountValue >= 0 && discountValue <= 100) {
      setDiscount(discountValue);
      toast.success(`Discount of ${discountValue}% applied!`);
    } else {
      toast.error("Please enter a valid discount percentage (0-100).");
    }
    setDiscountInput("");
  };

  return (
    <div>
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
                <div className="text-sm text-muted-foreground">Size: {size}</div>
                <div className="text-sm text-muted-foreground">Color: {color}</div>
              </>
            ) : (
              <small>{title}</small>
            )}
            <div className="font-semibold">${price}</div>
          </div>
          <div className="flex flex-col justify-between gap-8">
            <div className="flex items-center gap-4">
              {dropdown !== true && (
                <div className="flex items-center gap-2">
                  <Button onClick={() => decreaseQty(id)} variant="outline" size="sm">
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center">{quantity}</span>
                  <Button onClick={() => increaseQty(id)} variant="outline" size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <Button onClick={() => removeItem(id)} variant="outline" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CartItem;
