import Link from "next/link";
import React from "react";

interface CategoryCardProps {
  title: string;
  icon: React.ReactNode;
  count: number;
  color: string;
}

const CategoryCard = ({ title, icon, count, color }: CategoryCardProps) => {
  return (
    <Link
      href={`/category/${title.toLowerCase()}`}
      className="flex flex-col items-center p-6 rounded-xl bg-white border border-primary-foreground/10  shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary-foreground/20"
    >
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${color}`}
      >
        {icon}
      </div>
      <h3 className="font-display font-semibold text-lg text-landingsecondary mb-1">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground">{count} Events</p>
    </Link>
  );
};

export default CategoryCard;
