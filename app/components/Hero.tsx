function Hero() {
  return (
    <div className="grid min-h-[40vh] grid-cols-1 gap-8 bg-gray-50 bg-[url(/ev-trucks.png)] bg-right bg-no-repeat p-20 md:grid-cols-3 dark:bg-gray-800">
      <div className="rounded-xl border-white bg-neutral-900 p-10 md:col-span-2 lg:col-span-1">
        <h1 className="mb-5 font-[family-name:var(--font-geist-mono)] text-4xl">
          EV Fleet Charge Planner
        </h1>
        <p className="text-end text-base">
          Receive key charging insights about your fleet to optimize your
          logistic operations
        </p>
      </div>
      {/* <img src="ev-trucks.png" alt="charging trucks" /> */}
    </div>
  );
}

export default Hero;
