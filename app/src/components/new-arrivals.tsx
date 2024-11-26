"use client";
import Product from "./product/product";
import { productsData } from "./product/product-data";

export default function NewArrivals() {

  return (
    <div className="mx-10 my-8">
      {/* New Arrivals Section */}
      <div>
        <h2 className="mb-8 text-center text-3xl font-bold">New Arrivals</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 md:grid-cols-3">
          {productsData.map((product) => (
            <Product
              id={product.id}
              image={product.image}
              hot={product.hot}
              discount={product.discount}
              title={product.title}
              price={product.price}
              originalPrice={product.originalPrice}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
