// ---- date helpers (local time; no timezone drift) ----
const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const endOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
};

// default last 30 days (including today)
export const last30DaysRange = () => {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - 29);
  return { startDate: startOfDay(start), endDate: endOfDay(today) };
};

export const todayRange = () => {
  const today = new Date();
  return {
    startDate: startOfDay(today),
    endDate: endOfDay(today),
  };
};

export const maxRange = () => {
  const today = new Date();
  const t = new Date(today);
  const s = new Date(2020, 0, 1);

  return {
    label: "Max",
    startDate: startOfDay(s),
    endDate: endOfDay(t),
  };
};
