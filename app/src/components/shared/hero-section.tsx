export function HeroSection() {
  return (
    <div className="h-[75vh] w-full flex">
      <div className="bg-mute1 h-full w-2/3 flex">
        <div className="w-1/2 ml-10 flex justify-center items-center ">
          <div className="">
            <p className="tex-lg text-white">Limited Time Offer</p>
            <p className="text-6xl font-bold my-3 text-white leading-tight">
              Up to 20% Discount
            </p>
            <button className="py-2 px-6 bg-white hover:bg-transparent hover:border dark:text-black rounded">
              Shop Now
            </button>
          </div>
        </div>
        <div className=" w-1/2 h-full overflow-hidden">
          <div className="carousel1-image mt-20 h-full"></div>
        </div>
      </div>
      <div className="w-1/3 h-full flex flex-col">
        <div className="h-[37.5vh] bg-red-800 w-full carousel2-image py-10 pl-10">
          <p className="text-black dark:text-black font-semibold">Black Friday</p>
          <p className="font-extrabold dark:text-black text-4xl my-4">Big Sale <br /> Eye Shadow</p>
          <p className="dark:text-black">Over +50 Items</p>
          <button className="py-2 px-6 mt-3 text-black bg-white hover:bg-black hover:text-white hover:border hover:border-white rounded">
            Shop Now
          </button>
        </div>
        <div className="h-[37.5vh] w-full pl-10 py-10 carousel3-image">
          <p className="text-black dark:text-black font-semibold">Black Friday</p>
          <p className="font-extrabold dark:text-black text-4xl my-4">Puffer Jacket <br /> 20% Off</p>
          <p className="dark:text-black">Over +50 Items</p>
          <button className="py-2 px-6 mt-3 text-black bg-white hover:bg-black hover:text-white hover:border hover:border-white rounded">
            Shop Now
          </button>
        </div>
      </div>
    </div>
  );
}
