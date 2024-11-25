"use client"

import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from "next/image"
import Link from "next/link"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

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
      image: "/placeholder.svg",
      bgColor: "bg-[#C65D47]",
      textColor: "text-white",
    },
    {
      id: 2,
      title: "Big Sale",
      subtitle: "Eyeshadow",
      tag: "BLACK FRIDAY",
      description: "Over +100 items",
      image: "/placeholder.svg",
      bgColor: "bg-[#C65D47]",
      textColor: "text-white",
    },
    {
      id: 3,
      title: "Puffer Jacket",
      subtitle: "30% off",
      tag: "NEW COLLECTION",
      description: "Best jacket in year",
      image: "/placeholder.svg",
      bgColor: "bg-[#C65D47]",
      textColor: "text-white",
    },
  ]

  React.useEffect(() => {
    const timer = setInterval(nextSlide, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex flex-col md:flex-row">
      <div className="relative w-full md:w-full lg:w-[70%] overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(-${currentSlide * 100}%)`,
            width: `${totalSlides * 100}%`,
          }}
        >
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className="relative w-full"
              style={{ flex: `0 0 ${100 / totalSlides}%` }}
            >
              <div className={`${slide.bgColor} ${slide.textColor}`}>
                <div className="container mx-auto flex min-h-[500px] flex-col justify-center p-8">
                  {slide.tag && (
                    <span className="mb-4 text-sm font-medium">{slide.tag}</span>
                  )}
                  <h2 className="mb-2 text-5xl font-bold">{slide.title}</h2>
                  <h3 className="mb-4 text-4xl font-bold">{slide.subtitle}</h3>
                  {slide.brand && (
                    <p className="mb-6 text-4xl font-light">{slide.brand}</p>
                  )}
                  {slide.description && (
                    <p className="mb-6">{slide.description}</p>
                  )}
                  <div className="flex items-center gap-4">
                    <Button
                      asChild
                      className="rounded-full bg-white text-black hover:bg-gray-100"
                    >
                      <Link href="#">SHOP NOW</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="absolute left-4 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full"
          onClick={prevSlide}
        >
          <ChevronLeft className="h-6 w-6" />
          <span className="sr-only">Previous slide</span>
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="absolute right-4 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full"
          onClick={nextSlide}
        >
          <ChevronRight className="h-6 w-6" />
          <span className="sr-only">Next slide</span>
        </Button>

        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {[...Array(totalSlides)].map((_, index) => (
            <button
              key={index}
              className={`h-2 w-2 rounded-full ${
                currentSlide === index ? "bg-white" : "bg-white/50"
              }`}
              onClick={() => setCurrentSlide(index)}
            >
              <span className="sr-only">Go to slide {index + 1}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="w-full md:w-full lg:w-[30%] flex flex-col md:flex-row lg:flex-col">
        <Card className="flex-1">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold uppercase">BLACK FRIDAY</h3>
            <h2 className="mt-2 text-2xl font-bold">Big Sale Eyeshadow</h2>
            <p className="mt-2 text-sm text-muted-foreground">Over +100 items</p>
            <Button className="mt-4" variant="outline">
              SHOP NOW
            </Button>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold uppercase">NEW COLLECTION</h3>
            <h2 className="mt-2 text-2xl font-bold">Puffer Jacket 30% off</h2>
            <p className="mt-2 text-sm text-muted-foreground">Best jacket in year</p>
            <div className="mt-4 flex items-center justify-between">
              <Button variant="outline">SHOP NOW</Button>
              <span className="rounded-full bg-red-600 px-3 py-1 text-lg font-bold text-white">
                $29
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

