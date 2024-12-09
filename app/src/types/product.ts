export interface ProductProps{
  id: string
  title: string
  price: number
  originalPrice?: number
  image: string
  hot?: boolean
  discount?: number
  rating: number
  description?: string
  vedorId?: string
}