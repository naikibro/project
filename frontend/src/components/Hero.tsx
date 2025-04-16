import { playfair } from "src/themes/fonts";

export default function Hero() {
  return (
    <section
      aria-label="hero-section"
      className="text-center mt-0 mb-32 mx-4 sm:mx-8 md:mx-16 lg:mx-24"
    >
      <h1
        className={`text-xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl tracking-tighter mb-6 ${playfair.variable} font-serif`}
      >
        The best website in the world
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 font-light">
        Discover the best things around you. Do it now, do it today!
      </p>
    </section>
  );
}
