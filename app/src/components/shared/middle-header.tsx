import { AlignRight, Heart, ShoppingCart, User } from "lucide-react";
import AllCategories from "../ui/all-categories";
import Logo from "../ui/logo";
import { SearchProductCategory } from "./shearch-product-category";

export default function MiddleHeader() {
  return (
    <div className="flex items-center gap-4 md:gap-6 mx-10 py-5">
      <button className="p-2 text-black">
        <AlignRight className="md:hidden flex" size={28} />
      </button>
      <div className="w-full md:w-1/4 ">
        <Logo />
      </div>
      <div className="w-2/4 overflow-hidden hidden md:flex">
        <div className="flex flex-row pt-3 px-3 gap-2 items-center w-full bg-gray-100 rounded-sm">
          <AllCategories />
          <SearchProductCategory />
        </div>
      </div>

      <div className="w-full md:w-1/4 flex justify-end gap-3 items-center">
        <div className="flex gap-2 items-center hover:underline">
          <button className="p-2 text-gray-800 bg-gray-200 rounded-full">
            <User size={16} />
          </button>
          <p className="text-sm cursor-pointer">Account</p>
        </div>
        <div className="relative">
          <button className="p-2 text-gray-800 bg-gray-200 rounded-full">
            <Heart size={16} />
          </button>
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full transform translate-x-1/2 -translate-y-1/2">
            3
          </span>
        </div>
        <div className="relative">
          <button className="p-2 text-gray-800 bg-gray-200 rounded-full">
            <ShoppingCart size={16} />
          </button>
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full transform translate-x-1/2 -translate-y-1/2">
            5
          </span>
        </div>
      </div>
    </div>
  );
}
