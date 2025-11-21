// lib/exportToCSV.ts
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string
) {
  const headers = Object.keys(data[0] || {});
  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((h) => `"${String(row[h]).replace(/"/g, '""')}"`)
        .join(",")
    ),
  ];
  const csv = csvRows.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}