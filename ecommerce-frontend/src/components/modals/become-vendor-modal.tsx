'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog'
import { Button } from '../ui/button'
import Link from 'next/link'

export function BecomeVendorModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasShown, setHasShown] = useState(false)

  useEffect(() => {
    // Check if modal has been shown before
    const shown = localStorage.getItem('vendorModalShown')
    if (!shown) {
      // Show modal after 2 minutes
      const timer = setTimeout(() => {
        setIsOpen(true)
        localStorage.setItem('vendorModalShown', 'true')
        setHasShown(true)
      }, 120000)

      return () => clearTimeout(timer)
    } else {
      setHasShown(true)
    }
  }, [])

  if (hasShown) return null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Become a Vendor</DialogTitle>
          <DialogDescription>
            Start selling your products on our platform and reach millions of customers.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 space-y-4">
          <ul className="list-disc space-y-2 pl-4 text-sm">
            <li>Set up your own store</li>
            <li>Manage your inventory</li>
            <li>Track sales and analytics</li>
            <li>24/7 support</li>
          </ul>
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Maybe Later
            </Button>
            <Button asChild>
              <Link href="/become-vendor">Get Started</Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}