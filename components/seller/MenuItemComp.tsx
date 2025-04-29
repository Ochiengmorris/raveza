"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface ItemProps {
  title: string;
  items: {
    icon: React.ReactNode;
    label: string;
    href: string;
  }[];
}

const MenuItemComp: React.FC<ItemProps> = ({ title, items }) => {
  const pathname = usePathname();
  const splitPath = pathname.split("/").slice(0, 3).join("/");

  return (
    <div className="flex flex-col gap-2">
      <span className="text-gray-500 font-light my-4">{title}</span>
      {items.map((item) => {
        return (
          <Link
            href={item.href}
            key={item.label}
            className={`flex items-center ${splitPath === item.href && "bg-slate-300/20 text-primary"} justify-start gap-2 text-gray-400 p-3 rounded-md hover:bg-slate-300/20 transition-colors duration-200 ease-in-out`}
          >
            {item.icon}
            <span className="">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default MenuItemComp;
