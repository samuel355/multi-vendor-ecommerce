"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useVendor } from "@/hooks/use-vendor";
//import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";

import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Form } from "@/components/ui/form";

const vendorSchema = z.object({
  businessName: z.string().min(3, "Business name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  digitalAddress: z.string().optional(),
});

export default function BecomeVendorPage() {
  const { becomeVendor } = useVendor();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      businessName: "",
      description: "",
      phone: "",
      address: "",
      digitalAddress: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof vendorSchema>) => {
    try {
      setIsLoading(true);
      await becomeVendor.mutateAsync(data);
      toast.success("Vendor application submitted successfully");
      router.push("/vendor/dashboard");
    } catch (error) {
      console.log(error)
      toast.error("Error submitting vendor application");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Become a Vendor</h1>
        <p className="text-muted-foreground">
          Fill out the form below to start selling on our platform
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Form fields */}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit Application"}
          </Button>
        </form>
      </Form>
    </div>
  );
}