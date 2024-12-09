"use client";
import { AlignRight, Heart, ShoppingCart, User } from "lucide-react";
import AllCategories from "../ui/all-categories";
import Logo from "../ui/logo";
import { SearchProductCategory } from "./shearch-product-category";
import { useState } from "react";
import MobileSidebar from "./mobile-sidebar";
import CartContent from "./cart-content";
import FavoriteProducts from "./favorite-products-content";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/useStore";

export default function MiddleHeader() {
  const [openSheet, setSheetOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [favOpen, setFavOpen] = useState(false);
  const router = useRouter()
  const {items} = useCart()
  return (
    <>
      <div className="flex items-center gap-4 md:gap-6 md:mx-10 mx-6 py-5">
        <button
          onClick={() => setSheetOpen(true)}
          className="p-2 md:hidden flex"
        >
          <AlignRight size={24} />
        </button>
        <div className="w-full md:w-1/4 ">
          <Logo />
        </div>
        <div className="w-2/4 overflow-hidden hidden md:flex">
          <div className="flex flex-row pt-1 pb-1 px-2 space-x-2 items-center w-full bg-gray-100 rounded-sm">
            <AllCategories />
            <SearchProductCategory />
          </div>
        </div>

        <div className="w-full md:w-1/4 flex justify-end gap-3 items-center">
          <div className="hidden md:flex gap-2 items-center hover:underline">
            <button onClick={() => router.push('/sign-in')} className="p-2 text-gray-800 bg-gray-200 rounded-full">
              <User size={16} />
            </button>
            <p onClick={() => router.push('/sign-in')} className="text-sm cursor-pointer">Account</p>
          </div>
          <div className="relative">
            <button
              onClick={() => setFavOpen(!favOpen)}
              className="p-2 text-gray-800 bg-gray-200 rounded-full"
            >
              <Heart size={16} />
            </button>
            <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full transform translate-x-1/2 -translate-y-1/2">
              3
            </span>
            <FavoriteProducts open={favOpen} setOpen={setFavOpen} />
          </div>
          <div className="relative">
            <button
              onClick={() => setCartOpen(!cartOpen)}
              className="p-2 text-gray-800 bg-gray-200 rounded-full"
            >
              <ShoppingCart size={16} />
            </button>
            <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full transform translate-x-1/2 -translate-y-1/2">
              {items.length > 0 ? items.length : ""}
            </span>

            <CartContent open={cartOpen} setOpen={setCartOpen} />
          </div>
        </div>
      </div>
      <MobileSidebar open={openSheet} setOpen={setSheetOpen} />
    </>
  );
}
