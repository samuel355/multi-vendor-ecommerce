"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Search } from "lucide-react";

export function SearchProductCategory() {
  const formSchema = z.object({
    search: z.string().min(2, {
      message: "product name must be at least 2 characters",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: "",
    },
  });

  const searchProduct = async (values: z.infer<typeof formSchema>) => {
    console.log(values);
  };

  return (
    <div className="flex w-full">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(searchProduct)}
          className="flex items-center w-full  pb-0 mb-0"
        >
          <FormField
            control={form.control}
            name="search"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <input
                    className="dark:text-gray-800 w-full text-sm md:px-3 md:py-0 px-2 border-none bg-transparent border-0 focus:outline-none active:ring-0 active:border-none active:border-0 focus:border-transparent focus:ring-0"
                    type="search"
                    placeholder="Search Product..."
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <Button type="submit" className="dark:border">
            <Search size={18} />
          </Button>
        </form>
      </Form>
    </div>
  );
}
