export const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const isoString = date.toISOString();
  console.log("isoString :>> ", isoString);
  return isoString.split("T")[0];
};

export function excelToTimestampZ(excelDate: number) {
  const date = new Date((excelDate - 25569) * 86400 * 1000);
  return date.toISOString(); // e.g., '2024-09-27T23:59:00.000Z'
}
