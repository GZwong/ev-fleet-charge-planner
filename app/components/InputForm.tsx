import NumericInputWithValidation from "./NumericInputWithValidation";

function InputForm() {
  return (
    <div className="p-20">
      <h1 className="mb-2 text-xl">Inputs</h1>
      <p>
        This is a simple tool - minimal information required - we provide useful
        insights by making educated assumptions. You can choose to provide more
        details if data is available.
      </p>
      <hr className="m-auto mt-10 mb-10 w-[80%]"></hr>
      <form>
        <div className="grid grid-cols-1 gap-x-10 gap-y-5 md:grid-cols-2 lg:grid-cols-3">
          <NumericInputWithValidation
            label="Number of Electric Vehicles"
            minVal={0}
          />
          <NumericInputWithValidation label="Average Daily Mileage per EV (mi)" />
          <NumericInputWithValidation
            label="Battery Capacity (kWh)"
            info="<p>Light vehicles: 200kWh<p> <p>Heavy-duty trucks: 1200kWh<p>"
          />
          <NumericInputWithValidation label="Charging Power Rating (kW)" />
          <NumericInputWithValidation label="Vehicle Efficiency (mi/kWh)" />
        </div>
      </form>
    </div>
  );
}

export default InputForm;
