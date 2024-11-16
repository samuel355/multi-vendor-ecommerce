"use client";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";
import {
  AlignRight,
  ChevronRight,
  Home,
  House,
  LayoutList,
  ScanBarcode,
  ShoppingBag,
  TicketPercent,
  User,
  UserRoundPlus,
} from "lucide-react";
import Link from "next/link";

type MobileSidebarType = {
  open: boolean;
  setOpen: (isOpen: boolean) => void;
};

const MobileSidebar = ({ open, setOpen }: MobileSidebarType) => {
  const categories = [
    { id: "fashion", name: "Fashion" },
    { id: "phone-tablet", name: "Phone & Tablet" },
    { id: "laptop-computer", name: "Laptop & Computer" },
    { id: "tv-audio-video", name: "TV, Audio – Video" },
    { id: "camera-photo", name: "Camera & Photo" },
    { id: "home-decor", name: "Home & Decor" },
    { id: "beauty-health", name: "Beauty & Health" },
    { id: "game-accessories", name: "Game Accessories" },
    { id: "autopart", name: "Autopart" },
  ];

  const navItems = [
    {
      id: 1,
      title: "Home",
      href: "/",
      icon: <Home size={16} />,
    },
    {
      id: 2,
      title: "Categories",
      href: "/Categories",
      icon: <LayoutList size={16} />,
    },
    {
      id: 3,
      title: "Products",
      href: "/products",
      icon: <ScanBarcode size={16} />,
    },
    {
      id: 4,
      title: "Vendors",
      href: "/vendors",
      icon: <UserRoundPlus size={16} />,
    },
    {
      id: 5,
      title: "Shops",
      href: "/shops",
      icon: <ShoppingBag size={16} />,
    },
    {
      id: 6,
      title: "Discount Goods",
      href: "/discount-goods",
      icon: <TicketPercent size={16} />,
    },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side={"left"} className="flex flex-col justify-between">
        <div>
          <SheetHeader>
            <SheetTitle className="border-b">SHOP BY CATEGORY</SheetTitle>
          </SheetHeader>
          <div className="w-full relative">
            {navItems.map((item, index) => (
              <Link
                key={item.id}
                href={item.href}
                className={`flex cursor-pointer justify-between text-sm items-center text-black dark:text-white w-full ${index === 1 ? "mt-2" : "mt-1"} p-1 rounded-md`}
              >
                <div className="flex items-center gap-4">
                  {item.icon}
                  <p>{item.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="flex gap-2 items-center hover:underline">
          <button className="p-2 text-gray-800 bg-gray-200 rounded-full">
            <User size={16} />
          </button>
          <p className="text-sm cursor-pointer">Account</p>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
