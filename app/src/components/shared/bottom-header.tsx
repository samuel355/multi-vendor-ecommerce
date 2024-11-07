"use client";
import { ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FashionCategory } from "../categories/fashion-category";

const categories = [
  { id: "fashion", name: "Fashion" },
  { id: "phone-tablet", name: "Phone & Tablet" },
  { id: "laptop-computer", name: "Laptop & Computer" },
  { id: "tv-audio-video", name: "TV, Audio – Video" },
  { id: "camera-photo", name: "Camera & Photo" },
];

export default function BottomHeader() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      console.log("Rendered content ref:", contentRef.current);
    }
  }, [activeCategory]);

  const renderCategoryContent = (categoryId: string | null) => {
    switch (categoryId) {
      case "fashion":
        return <FashionCategory />
      // Add cases for other categories
      default:
        return null;
    }
  };
  
  return (
    <div className="w-full border-t relative flex gap-3 items-center">
      <div className="md:mx-10 mx-6 py-3">
        <Button variant={"outline"}>SHOP BY CATEGORIES</Button>
      </div>
      <div className="flex items-center gap-3 flex-wrap w-full text-sm">
        {categories.map((category) => (
          <Link
            key={category.id}
            onMouseEnter={() => setActiveCategory(category.id)}
            className="flex items-center cursor-pointer hover:underline"
            href="/"
          >
            <span className="cursor-pointer">{category.name}</span>{" "}
            <ChevronRight className="mt-[2px]" size={15} />
          </Link>
        ))}
      </div>

      {activeCategory && (
        <div
          onMouseEnter={() => {}}
          onMouseLeave={() => setActiveCategory(null)}
          className={`absolute z-10 w-[90vw] top-16 mx-6 md:mx-10 shadow border`}
        >
          {renderCategoryContent(activeCategory)}
        </div>
      )}
    </div>
  );
}
