export function exportToCSV(data) {
  const header = "Age,Happiness\n";
  const csvContent = data
    .map((happiness, age) => `${age},${happiness}`)
    .join("\n");
  const fullContent = header + csvContent;

  const blob = new Blob([fullContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "happiness_timeline.csv");
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
