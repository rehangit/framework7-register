export const dateToSerial = (date) => {
  const startOfDay = new Date(new Date(date).toISOString().slice(0, 10));
  const serial = Math.floor(
    (startOfDay - new Date('1899-12-30')) / (1000 * 3600 * 24)
  );
  console.log('Converting date to serial', { date, serial });
  return serial;
};

export const indexToLetter = (n) => {
  const a = Math.floor(n / 26);
  if (a >= 0) return indexToLetter(a - 1) + String.fromCharCode(65 + (n % 26));
  else return '';
};

export const serialToDate = (serial) =>
  new Date((Math.floor(serial) - 25569) * 86400 * 1000);
