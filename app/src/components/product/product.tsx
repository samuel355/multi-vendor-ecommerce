import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { Heart, ShoppingCart } from "lucide-react";

export function Prouduct(){
  return(
    <div className="p-2 flex flex-col gap-4 border-[0.2px] border-gray-100 rounded shadow">
      <div className="flex justify-between">
        <Button size={'sm'} variant='outline' className="text-xs p-1 bg-red-700 text-white"> -10%</Button>
        <div className="flex flex-col gap-1">
          <Button size={'sm'} variant='outline'> 
            <Heart className="dark:text-white text-black" size={14} />
          </Button>
          <Button className="dark:text-white text-black" size={'sm'} variant='outline'>
            <ShoppingCart size={14} />
          </Button>
        </div>
      </div>
      <div className="rounded-md">
        <Link href={'/'}>
          <Image className="object-cover w-full h-48" src={'/products/sneaker.jpg'} width={100} height={100} alt="product-image" />
        </Link>
      </div>
      <div>
        <p className="text-sm">Nike Air Max Unisex SYSTM Men Sneaker Shoes</p>
        <p className="font-semibold mt-1">GHS 250</p>
      </div>
    </div>
  )
}