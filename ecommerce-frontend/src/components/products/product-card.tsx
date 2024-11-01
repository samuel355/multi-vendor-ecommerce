import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/store/useCart'
import { Button } from '../ui/button'
import { toast } from 'react-hot-toast'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../ui/hover-card'

interface ProductCardProps {
  product: {
    id: string
    name: string
    price: number
    image: string
    description: string
    vendorId: string
    vendorName: string
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCart((state) => state.addItem)

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      vendorId: product.vendorId,
    })
    toast.success('Added to cart')
  }

  return (
    <div className="group relative rounded-lg border bg-background p-4 transition-shadow hover:shadow-lg">
      <Link href={`/products/${product.id}`}>
        <div className="aspect-square overflow-hidden rounded-md">
          <Image
            src={product.image}
            alt={product.name}
            width={300}
            height={300}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
      </Link>
      <div className="mt-4">
        <HoverCard>
          <HoverCardTrigger asChild>
            <Link href={`/products/${product.id}`}>
              <h3 className="text-lg font-semibold">{product.name}</h3>
            </Link>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {product.description}
              </p>
              <p className="text-sm">
                Sold by{' '}
                <Link
                  href={`/vendors/${product.vendorId}`}
                  className="font-medium hover:underline"
                >
                  {product.vendorName}
                </Link>
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>
        <p className="mt-2 text-xl font-bold">
          ${product.price.toFixed(2)}
        </p>
        <Button
          onClick={handleAddToCart}
          className="mt-4 w-full"
        >
          Add to Cart
        </Button>
      </div>
    </div>
  )
}