import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import { ProductCard } from '../products/product-card'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const featuredProducts = [
  {
    id: '1',
    name: 'Product 1',
    price: 99.99,
    image: '/product1.jpg',
    description: 'Amazing product description',
    vendorId: 'v1',
    vendorName: 'Vendor 1',
  },
  // Add more products...
]

export function FeaturedProducts() {
  return (
    <section className="py-12">
      <div className="container">
        <h2 className="mb-8 text-3xl font-bold">Featured Products</h2>
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000 }}
          breakpoints={{
            640: {
              slidesPerView: 2,
            },
            768: {
              slidesPerView: 3,
            },
            1024: {
              slidesPerView: 4,
            },
          }}
        >
          {featuredProducts.map((product) => (
            <SwiperSlide key={product.id}>
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  )
}