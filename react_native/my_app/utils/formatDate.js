export default function formatDate(date) {
    if (!date) return null;
    const parts = date.split("/");
    if (parts.length === 2) {
      const month = parts[0].padStart(2, "0");
      const day = parts[1].padStart(2, "0");
      const year = new Date().getFullYear();
      return `${year}-${month}-${day}`;
    }
    return date;
  }
  