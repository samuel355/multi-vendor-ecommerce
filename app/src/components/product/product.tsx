import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Badge } from "../ui/badge";
import { ProductProps } from "@/types/product";
import { usePathname } from "next/navigation";
import { useCart } from "@/store/useStore";
import { toast } from "sonner";

const Product = ({
  id,
  image,
  hot,
  discount,
  title,
  price,
  originalPrice,
  rating,
  vedorId,
  description
}: ProductProps) => {
  const pathname = usePathname();
  
  const productData: ProductProps = {
    id,
    title,
    price,
    image,
    rating,
    description,
    vedorId,
    originalPrice,
    hot,
    discount,
  };

  const {
    addItem,
    removeItem,
    addToFavorites,
    removeFromFavorites,
    isInCart,
    isInFavorites,
    items
  } = useCart();

  // Handle cart operations
  const handleCartAction = () => {
    if (isInCart(id)) {
      //removeItem(id);
      toast.success("Product already in cart");
    } else {
      addItem(productData);
      toast.success("Added to cart");
      console.log(productData);
    }
  };
  
  //Handle favorite operations
  const handleFavoriteAction = () => {
    if (isInFavorites(id)) {
      //removeFromFavorites(id);
      toast.success("Products Already in Favorites");
    } else {
      addToFavorites(productData);
      console.log(productData)
      toast.success("Added to favorites");
    }
  };

  console.log(items)
  return (
    <Card key={id} className="group relative overflow-hidden">
      <CardContent className="p-0">
        <div className="relative aspect-square">
          <Link href={`/product-details/${id}`}>
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
          <div className="absolute right-2 top-2 flex flex-col gap-2">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={handleFavoriteAction}
            >
              <Heart className="h-4 w-4" />
              <span className="sr-only">Add to wishlist</span>
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className={`h-8 w-8 rounded-full ${isInCart(id) ? 'bg-red-600' : ''}`}
              onClick={handleCartAction}
            >
              <ShoppingCart fill={isInCart(id) ? 'red': ''} className="h-4 w-4" />
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
        <Link
          href={`/product-details/${id}`}
          className="line-clamp-2 hover:underline"
        >
          {title}
        </Link>

        {pathname.includes("/shop") && (
          <div className="mt-2 flex items-center gap-1">
            {[...Array(5)].map((_, i) => {
              const isFullStar = i < Math.floor(rating);
              const isHalfStar = i === Math.floor(rating) && rating % 1 !== 0;

              return (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    isFullStar
                      ? "fill-yellow-400 text-yellow-400"
                      : isHalfStar
                        ? "fill-yellow/50 text-yellow-400"
                        : "fill-muted text-muted"
                  }`}
                />
              );
            })}
            <span className="ml-1 text-sm text-muted-foreground">
              {rating}/{5}
            </span>
          </div>
        )}

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
};

export default Product;
