import CategoriesSection from "@/components/home/sections/CategoriesSection";
import CTASection from "@/components/home/sections/Cta";
import FeaturedEventsSection from "@/components/home/sections/FeaturedEventsSection";
import HeroSection from "@/components/home/sections/HeroSection";
import Upcoming from "@/components/home/sections/Upcoming";
import React from "react";

const page = () => {
  return (
    <div>
      <HeroSection />
      <FeaturedEventsSection />
      <CategoriesSection />
      <Upcoming />
      <CTASection />
    </div>
  );
};

export default page;
