"use client"

import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from "next/image"
import Link from "next/link"
import * as React from "react"

import { Button } from "@/components/ui/button"

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = React.useState(0)
  const totalSlides = 3

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
  }

  const slides = [
    {
      id: 1,
      title: "Up To 20%",
      subtitle: "Instant Camera",
      brand: "Fujifilm's",
      tag: "Limited time offer *",
      image: "/carousel/banner1.jpg?height=600&width=600",
      bgColor: "bg-[#C65D47]",
      textColor: "text-white",
    },
    {
      id: 2,
      title: "New Honda CR-V",
      subtitle: "2024 Model",
      tag: "Available Now",
      image: "/carousel/banner2.jpg?height=600&width=600",
      bgColor: "bg-[#C65D47]",
      textColor: "text-white",
    },
    {
      id: 3,
      title: "Summer Collection",
      subtitle: "New Arrivals",
      tag: "Limited Edition",
      image: "/carousel/banner3.jpg?height=600&width=600",
      bgColor: "bg-[#C65D47]",
      textColor: "text-white",
    },
  ]

  React.useEffect(() => {
    const timer = setInterval(nextSlide, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex h-[70vh] border-b">
      {/* Main Slider - 2/3 width */}
      <div className="relative w-2/3">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute left-0 top-0 h-full w-full ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            } transition-opacity ease-in duration-500`}
          >
            <div className="relative flex h-full items-center justify-between">
              <div className="z-10 w-full pl-10">
                {slide.tag && (
                  <span className="mb-4 block text-sm font-medium">
                    {slide.tag}
                  </span>
                )}
                <h2 className="mb-4 text-6xl font-bold leading-tight">
                  {slide.title}
                </h2>
                <h3 className="mb-4 text-4xl font-bold">{slide.subtitle}</h3>
                {slide.brand && (
                  <p className="mb-8 text-4xl font-light">{slide.brand}</p>
                )}
                <Button
                  asChild
                  className="rounded-full px-8"
                  size="lg"
                >
                  <Link href="#">SHOP NOW</Link>
                </Button>
              </div>
              <div className='w-full h-full bg-no-repeat bg-cover bg-center' style={{backgroundImage: `url(${slide.image})`}}>

              </div>
            </div>
          </div>
        ))}

        <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`h-2 w-2 rounded-full transition-colors ${
                currentSlide === index ? "bg-white" : "bg-white/50"
              }`}
              onClick={() => setCurrentSlide(index)}
            >
              <span className="sr-only">Go to slide {index + 1}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Right Side Promotions - 1/3 width */}
      <div className="w-1/3 border-l">
        <div className="flex h-full flex-col">
          <div className="flex h-1/2 flex-col justify-center  p-8">
            <span className="text-sm font-semibold">BLACK FRIDAY</span>
            <h2 className="mt-2 text-4xl font-bold leading-tight">
              Big Sale
              <br />
              Eyeshadow
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Over +100 items
            </p>
            <Button
              variant="outline"
              className="mt-4 w-fit rounded-full px-6"
              size="sm"
            >
              SHOP NOW
            </Button>
          </div>

          <div className="relative flex h-1/2 flex-col justify-center  p-8 border-t">
            <span className="text-sm font-semibold">NEW COLLECTION</span>
            <h2 className="mt-2 text-4xl font-bold leading-tight">
              Puffer Jacket
              <br />
              30% off
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Best jacket in year
            </p>
            <div className="mt-4 flex items-center gap-4">
              <Button variant="outline" className="rounded-full px-6" size="sm">
                SHOP NOW
              </Button>
              <span className="rounded-full bg-red-600 px-4 py-2 text-lg font-bold text-white">
                $29
              </span>
            </div>
            <div className="absolute bottom-0 right-0 h-48 w-48">
              <Image
                src="/placeholder.svg?height=200&width=200"
                alt="Puffer jacket"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

