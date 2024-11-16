import { BadgeCent, ClockArrowDown, ThumbsUp, Truck } from "lucide-react";

const items = [
  {
    id: '1',
    title: 'Fast, Nationwide Deliver',
    sub: 'On all order',
    icon: <Truck className="text-gray-300 hover:text-gray-700" size={36} />
  },
  {
    id: '2',
    title: 'Next Day Delivery',
    sub: 'Spend over GHS 500',
    icon: <ClockArrowDown className="text-gray-300 hover:text-gray-700" size={36} />
  },
  {
    id: '3',
    title: 'Low Price Qualantee',
    sub: 'We offer competitive prices',
    icon: <BadgeCent className="text-gray-300 hover:text-gray-700" size={36} />
  },
  {
    id: '4',
    title: 'Quality Guaranteed',
    sub: 'We guarantee our products',
    icon: <ThumbsUp className="text-gray-300 hover:text-gray-700" size={36} />
  }
]

export function NoteSection() {
  return (
    <div className="w-full h-30 p-10 grid gap-8 grid-cols-2 lg:grid-cols-4">
      {
        items.map((item) => (
          <div key={item.id} className="flex flex-col md:flex-row  gap-3">
            {item.icon}
            <div>
              <p className="text-normal">{item.title}</p>
              <p className="font-normal text-xs text-gray-400">{item.sub}</p>
            </div>
          </div>
        ))
      }
    </div>
  );
}
