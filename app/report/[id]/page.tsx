import { notFound } from "next/navigation";

async function getReportData(reportId: string) {
  const apiUrl = `/api/routes?id=${encodeURIComponent(reportId)}`;

  const res = await fetch(apiUrl);

  if (!res.ok) return null;

  return res.json();
}

export default async function ReportPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  if (!id) {
    console.error("No report ID found in params");
    return notFound(); // Handle the case where the ID is not available
  }

  // Fetch the report data
  const report = await getReportData(id);

  if (!report) {
    console.log("Report not found!");
    return notFound(); // Return a "not found" page if no report is found
  }

  return (
    <div>
      <h1>Report Details</h1>
      <pre>{JSON.stringify(report, null, 2)}</pre>
    </div>
  );
}
