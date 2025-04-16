"use client";
import Footer from "src/components/common/Footer";
import Navbar from "src/components/common/navbar/Navbar";
import Hero from "src/components/Hero";

export default function Page() {
  return (
    <>
      <Navbar />
      <div className="flex flex-col min-h-screen bg-white dark:bg-white">
        <Hero />
        <Footer />
      </div>
    </>
  );
}
