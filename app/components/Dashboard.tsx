type Result = {
  dailyEnergyConsumption: number;
  chargeTimePerEV: number;
  totalFleetEnergyDemand: number;
};

export default function Dashboard() {
  return (
    <div className="container">
      <h1 className="text-lg">Results</h1>
      <p>Here are the results based on your inputs</p>
    </div>
  );
}
