import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="text-center py-20">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to MultiVendor Marketplace
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Shop from multiple vendors in one place
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/stores">Browse Stores</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/register-vendor">Become a Vendor</Link>
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border rounded-lg p-6 text-center">
          <h3 className="text-xl font-semibold mb-2">For Shoppers</h3>
          <p className="text-gray-600">
            Browse thousands of products from verified vendors
          </p>
        </div>
        <div className="border rounded-lg p-6 text-center">
          <h3 className="text-xl font-semibold mb-2">For Vendors</h3>
          <p className="text-gray-600">
            Create your store and start selling today
          </p>
        </div>
        <div className="border rounded-lg p-6 text-center">
          <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
          <p className="text-gray-600">Safe and secure payments via Paystack</p>
        </div>
      </section>
    </div>
  );
}
