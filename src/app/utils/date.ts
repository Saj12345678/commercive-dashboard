export const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const isoString = date.toISOString();
  console.log("isoString :>> ", isoString);
  return isoString.split("T")[0];
};
