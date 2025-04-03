import Image from "next/image";
import Hero from "./components/Hero";
import InputPage from "./components/InputPage";
import Dashboard from "./components/Dashboard";

export default function Home() {
  return (
    <>
      <Hero />
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14">
        <InputPage />
      </div>
    </>
  );
}
