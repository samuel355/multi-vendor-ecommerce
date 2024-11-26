import Link from "next/link";
import Product from "../product/product";
import { productsData } from "../product/product-data";

const phone = [
  { id: 1, title: "Accessories" },
  { id: 2, title: "Coats & Jackets" },
  { id: 3, title: "Dress" },
  { id: 4, title: "Shirt" },
  { id: 5, title: "Skirts" },
  { id: 6, title: "Shoes" },
  { id: 7, title: "Tops" },
  { id: 8, title: "Blazers" },
  { id: 9, title: "Jewelry" },
  { id: 10, title: "Hairs" },
];

const tablet = [
  { id: 1, title: "Accessories" },
  { id: 2, title: "Coats & Jackets" },
  { id: 3, title: "Cargo Trousers" },
  { id: 4, title: "Shirt" },
  { id: 5, title: "Hoodies" },
  { id: 6, title: "Shoes" },
  { id: 7, title: "Jeans" },
  { id: 8, title: "Shorts" },
  { id: 9, title: "Joggers" },
  { id: 10, title: "Suits" },
];

export function PhoneTablet() {
  return (
    <div className="mx-6 md:mx-10 flex gap-16 my-4 duration-300 transition-opacity">
      <div className="h-full">
        <h4 className="pb-6 font-semibold">Phones</h4>
        <div className="flex flex-col flex-wrap gap-3">
          {phone.map((item) => (
            <Link
              className="text-sm font-thin hover:underline"
              key={item.id}
              href={"/"}
            >
              {item.title}
            </Link>
          ))}
        </div>
      </div>

      <div className="h-full">
        <h4 className="pb-6 font-semibold">Tablets</h4>
        <div className="flex flex-col flex-wrap gap-3">
          {tablet.map((item) => (
            <Link
              className="text-sm font-thin hover:underline"
              key={item.id}
              href={"/"}
            >
              {item.title}
            </Link>
          ))}
        </div>
      </div>

      <div className="">
        <h4 className="pb-6 font-semibold">Top Picks</h4>
        <div className="flex gap-4">
          {productsData.slice(0, 2).map((product) => (
            <Product
              id={product.id}
              image={product.image}
              hot={product.hot}
              discount={product.discount}
              title={product.title}
              price={product.price}
              originalPrice={product.originalPrice}
              rating={product.rating}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
