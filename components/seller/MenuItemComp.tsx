"use client";

import { usePathname, useRouter } from "next/navigation";
import React from "react";

interface ItemProps {
  title: string;
  items: {
    icon: React.ReactNode;
    label: string;
    href: string;
  }[];
  toggleSidebar?: () => void;
}

const MenuItemComp: React.FC<ItemProps> = ({ title, items, toggleSidebar }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobile, setIsMobile] = React.useState(false);
  const splitPath = pathname.split("/").slice(0, 3).join("/");

  React.useEffect(() => {
    if (window.innerWidth < 768) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-gray-500 font-light my-4">{title}</span>
      {items.map((item) => {
        return (
          <button
            onClick={async () => {
              await router.push(item.href);
              if (toggleSidebar) toggleSidebar();
            }}
            key={item.label}
            className={`flex items-center ${splitPath === item.href && "bg-slate-300/20 text-primary font-semibold"} justify-start gap-2 p-3 rounded-md ${isMobile ? "text-gray-600" : "text-gray-400"}  hover:bg-slate-300/20 transition-colors duration-200 ease-in-out`}
          >
            {item.icon}
            <span className="">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default MenuItemComp;
