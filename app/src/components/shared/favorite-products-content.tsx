import React, { FC } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface Props {
  open: boolean;
  setOpen: (isOpen: boolean) => void;
}

const FavoriteProducts: FC<Props> = ({ open, setOpen }) => {
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button aria-label="Toggle menu"></button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64 mt-2 mr-2">
        <div className="">
          Here we go again to see if we can make it happen lorem
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FavoriteProducts;
