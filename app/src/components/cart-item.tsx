import { FC } from "react";
import { Card, CardContent } from "./ui/card";
import Image from "next/image";
import { Button } from "./ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";

interface CartProps {
  id: string;
  image: string;
  title: string;
  size?: string;
  color?: string;
  price: number;
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
  return (
    <Card key={id}>
      <CardContent className="flex items-start gap-4 p-4">
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
              <div className="text-sm text-muted-foreground">
                Color: {color}
              </div>
            </>
          ) : (
            <>
              <small>{title}</small>
            </>
          )}
          <div className="font-semibold">${price}</div>
        </div>
        {dropdown !== true && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon">
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center">{quantity}</span>
            <Button variant="outline" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
        <Button variant="ghost" size="icon" className="text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default CartItem;
