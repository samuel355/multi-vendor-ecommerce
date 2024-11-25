import React from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface Props {}

const NewsLetter: React.FC<Props> = () => {
  return (
    <div className="mt-16 bg-black text-white rounded-lg p-8">
      <div className="grid gap-6 md:grid-cols-2 items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">
            STAY UP TO DATE ABOUT
            <br />
            OUR LATEST OFFERS
          </h2>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Enter your email address"
            className="bg-white text-black"
          />
          <Button variant="secondary">Subscribe to Newsletter</Button>
        </div>
      </div>
    </div>
  );
};

export default NewsLetter;
