import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

const allCategories = [
  {
    id: "phones",
    title: "Phones",
    subs: {
      "1": "Smartphones",
      "2": "Feature Phones",
      "3": "Accessories",
    },
  },
  {
    id: "laptops",
    title: "Laptops",
    subs: {
      "1": "Gaming Laptops",
      "2": "Ultrabooks",
      "3": "Workstations",
    },
  },
  {
    id: "furniture",
    title: "Furniture",
    subs: {
      "1": "Living Room",
      "2": "Bedroom",
      "3": "Dining Room",
    },
  },

  {
    id: "men",
    title: "Men",
    subs: {
      "1": "Shirts",
      "2": "Pants",
      "3": "Shoes",
    },
  },
];

export default function AllCategories() {
  return (
    <div className="hidden md:flex flex-row space-x-4 items-center mb-3">
      <Select>
        <SelectTrigger className="w-[180px] outline-none border-none">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent className="bg-none bg-transparent">
          {
            allCategories.map((category) => (
              <SelectItem value={category.id} key={category.id}>
                {category.title }
              </SelectItem>
            ))
          }
        </SelectContent>
      </Select>
      <div className="w-[2px] h-8  bg-gray-700 z-10" />
    </div>
  );
}
