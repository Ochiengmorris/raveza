import React from "react";
import hero from "@/images/hero.jpg";
import Image from "next/image";
import Link from "next/link";

const HeroSection = () => {
  return (
    <section className="relative bg-black overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src={hero}
          alt="hero"
          className="w-full h-full object-cover"
          priority
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="text-center md:text-left md:max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-montserrat text-secondary leading-tight mb-6">
            Discover & Book
            <br />
            <span className="text-primary">Live Events</span>
          </h1>
          <p className="text-sm md:text-xl text-white opacity-90 mb-8 max-w-2xl md:max-w-3xl">
            Find and book tickets to the hottest concerts, festivals, theater
            performances, and more, all in one place.
          </p>
          <div className="flex flex-row justify-center md:justify-start gap-4">
            <Link
              href="/events"
              className="flex-1 md:flex-none py-3 md:px-6 md:py-4 bg-primary/90 hover:bg-primary text-accent text-sm md:text-md font-semibold rounded-md transition duration-200 flex items-center justify-center"
            >
              Explore Events
            </Link>
            <Link
              href="/categories"
              className="flex-1 md:flex-none py-3  md:px-6 md:py-4 bg-transparent hover:bg-primary/30 text-sm md:text-md text-accent border border-primary/40 hover:border-primary/5 font-semibold rounded-md transition duration-200 flex items-center shrink-0  justify-center"
            >
              Browse Categories
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
