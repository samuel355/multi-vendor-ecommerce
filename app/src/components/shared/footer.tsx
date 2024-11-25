import Image from "next/image"
import Link from "next/link"

import { Separator } from "@/components/ui/separator"
import { FC } from "react"

interface FooterProps{

}

const Footer:FC<FooterProps> = () => {
  return (
    <footer className="bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block">
              <h2 className="text-2xl font-bold">SHOPSIN</h2>
            </Link>
            <p className="mt-4 text-muted-foreground">
              We have clothes that suits your style and which you&apos;re proud to wear. From women to men.
            </p>
            <div className="mt-6 flex gap-4">
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <TwitterIcon className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <FacebookIcon className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <InstagramIcon className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <GithubIcon className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold">COMPANY</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  Works
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  Career
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">HELP</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  Customer Support
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  Delivery Details
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">RESOURCES</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  Free eBooks
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  Development Tutorial
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  How to - Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  Youtube Playlist
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <Separator className="my-8" />
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            ShopsIn © 2024. All Rights Reserved
          </p>
          <div className="flex items-center gap-3">
            <Image
              src="/icons/mastercard.png"
              alt="Visa"
              width={25}
              height={25}
              className="h-auto w-auto"
            />
            <Image
              src="/icons/visacard.png"
              alt="Mastercard"
              width={25}
              height={25}
              className="h-auto w-auto"
            />
            <Image
              src="/icons/apple.png"
              alt="Apple Pay"
              width={25}
              height={25}
              className="h-auto w-auto"
            />
            <Image
              src="/icons/google.png"
              alt="Google Pay"
              width={25}
              height={25}
              className="h-auto w-auto"
            />
            <Image
              src="/icons/paypal.png"
              alt="PayPal"
              width={25}
              height={25}
              className="h-auto w-auto"
            />
          </div>
        </div>
      </div>
    </footer>
  )
}

function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  )
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  )
}


export default Footer;