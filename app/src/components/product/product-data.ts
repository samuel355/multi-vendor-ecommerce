import { ProductProps } from "@/types/product";

const discounts = [10, 20, 30, 40, 50];
export const productsData: ProductProps[] = [
  {
    id: "1",
    title: "Milo Brass And Black Metal Lamp Ø18cm x 30cm",
    price: 82,
    image: "/products/black-shade.jpg",
    hot: true,
    rating: 4.5,
  },
  {
    id: "2",
    title: "Light Luxury Urban Leather Lounge Chair Home Living Room",
    price: 179,
    image: "/products/macbook-new.jpg",
    rating: 4,
  },
  {
    id: "3",
    title: "Howard Chandelier Six Long Arms – Gunmetal",
    price: 745,
    image: "/products/sneaker.jpg",
    rating: 4.5,
  },
  {
    id: "4",
    title: "14-inch Fasion Simplicity Quality Wall Clock, Home Decor",
    price: 50,
    originalPrice: 75,
    image: "/products/portable-speaker.jpg",
    discount: 33,
    rating: 4.5,
  },
  {
    id: "5",
    title: "Drawer Record Storage Cabinet Turntable Stand",
    price: 108,
    image: "/products/tv.jpg",
    rating: 4,
  },
  {
    id: "6",
    title: "Solid Wood Rattan Tv Unit – Natural Finish",
    price: 178,
    image: "/products/watch.jpg",
    rating: 4.5,
  },
];