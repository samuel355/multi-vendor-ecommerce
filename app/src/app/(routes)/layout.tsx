import BottomHeader from "@/components/shared/bottom-header";
import MiddleHeader from "@/components/shared/middle-header";
import TopHeader from "@/components/shared/top-header";
import React, { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const layout = ({ children }: Props) => {
  return (
    <div className="w-full">
      <TopHeader />
      <MiddleHeader />
      <BottomHeader />
      {children}
    </div>
  );
};

export default layout;
