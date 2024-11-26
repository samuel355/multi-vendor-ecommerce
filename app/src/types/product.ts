export interface Product{
  id: string
  title: string
  price: number
  originalPrice?: number
  image: string
  hot?: boolean
  discount?: number
}