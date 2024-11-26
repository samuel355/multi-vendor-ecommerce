import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { Heart, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Badge } from "../ui/badge";
import { ProductProps } from "@/types/product";

const Product = ({
  id,
  image,
  hot,
  discount, 
  title,
  price,
  originalPrice,
}: ProductProps) => {
  return (
    <Card key={id} className="group relative overflow-hidden">
      <CardContent className="p-0">
        <div className="relative aspect-square">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute right-2 top-2 flex flex-col gap-2">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full"
            >
              <Heart className="h-4 w-4" />
              <span className="sr-only">Add to wishlist</span>
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="sr-only">Add to cart</span>
            </Button>
          </div>
          {hot && (
            <Badge variant="destructive" className="absolute left-2 top-2">
              HOT
            </Badge>
          )}
          {discount && (
            <Badge variant="destructive" className="absolute left-2 top-2">
              -{discount}%
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 p-4">
        <Link href="#" className="line-clamp-2 hover:underline">
          {title}
        </Link>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold">${price}</span>
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ${originalPrice}
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

export default Product;