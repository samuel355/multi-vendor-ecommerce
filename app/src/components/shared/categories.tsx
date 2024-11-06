import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";

type CategoriesType = {
  open: boolean,
  setOpen: (isOpen: boolean) => void
};
export function Categories({open, setOpen}:CategoriesType){
  return(
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side={"left"}>
        <SheetHeader>
          <SheetTitle className="border-b">SHOP BY CATEGORY</SheetTitle>
        </SheetHeader>
        <div className="w-full relative">
          here we go again
        </div>
      </SheetContent>
    </Sheet>
  )
}