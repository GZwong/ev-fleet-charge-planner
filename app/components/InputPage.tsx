import InputForm from "./InputForm";

function InputPage() {
  return (
    <div className="p-20">
      <h1 className="mb-2 text-xl">Inputs</h1>
      <p>
        This is a simple tool - minimal information required - we provide useful
        insights by making educated assumptions. You can choose to provide more
        details if data is available.
      </p>
      <hr className="m-auto mt-10 mb-10 w-[80%]"></hr>
      <InputForm />
    </div>
  );
}

export default InputPage;
