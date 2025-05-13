import Link from "next/link";

export default function CTASection() {
  return (
    <section className="py-20 bg-[#120030] max-w-7xl mx-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold font-montserrat text-white mb-6">
          Ready to experience amazing events?
        </h2>
        <p className="text-sm md:text-lg lg:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Join thousands of people who use{" "}
          <span className="font-bold text-primary"> raveza</span> to discover
          and book tickets to the most exciting events happening near them.
        </p>
        <div className="flex flex-row justify-center gap-4">
          <Link
            href="/events"
            className="flex-1 md:flex-none py-3 md:w-44 md:px-6 md:py-4 bg-primary/90 hover:bg-primary text-accent text-sm md:text-md font-semibold rounded-md transition duration-200 flex items-center justify-center"
          >
            Explore Events
          </Link>
          <Link
            href="#how-it-works"
            className="flex-1 md:flex-none py-3 md:w-44 md:px-6 md:py-4 bg-transparent hover:bg-primary/30 text-sm md:text-md text-accent border border-primary/40 hover:border-primary/5 font-semibold rounded-md transition duration-200 flex items-center justify-center"
          >
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
}
