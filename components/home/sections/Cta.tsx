import Link from "next/link";

export default function CTASection() {
  return (
    <section className="py-20 bg-[#120030] max-w-7xl mx-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold font-montserrat text-white mb-6">
          Ready to experience amazing events?
        </h2>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Join thousands of people who use{" "}
          <span className="font-bold text-primary"> Raveza</span> to discover
          and book tickets to the most exciting events happening near them.
        </p>
        <div className="flex flex-row justify-center gap-4">
          <Link
            href="/events"
            className="flex-1 md:flex-none md:w-44 px-6 py-4 bg-primary/90 hover:bg-primary text-landingsecondary font-semibold rounded-md transition duration-200"
          >
            Explore Events
          </Link>
          <Link
            href="#how-it-works"
            className="flex-1 md:flex-none md:w-44 px-6 py-4 bg-transparent hover:bg-primary/30 text-white border border-primary/40 hover:border-primary/5 font-semibold rounded-md transition duration-200"
          >
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
}
