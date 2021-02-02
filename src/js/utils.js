export const dateToSerial = (date) => {
  const startOfDay = new Date(new Date(date).toISOString().slice(0, 10));
  const serial = Math.floor(
    (startOfDay - new Date('1899-12-30')) / (1000 * 3600 * 24)
  );
  return serial;
};

export const timestampToSerial = (timestamp) => {
  const startOfDay = new Date(new Date(timestamp).toISOString());
  const serial = (startOfDay - new Date('1899-12-30')) / (1000 * 3600 * 24);
  return serial;
};

export const indexToLetter = (n) => {
  const a = Math.floor(n / 26);
  if (a >= 0) return indexToLetter(a - 1) + String.fromCharCode(65 + (n % 26));
  else return '';
};

export const serialToDate = (serial) =>
  new Date((Math.floor(serial) - 25569) * 86400 * 1000);

export const toJson = (table) => {
  if (table.length < 1) return {};

  const header = table[0];
  return table.slice(1).reduce((acc, row) => {
    const rowData = header.reduce((rec, key, c) => {
      rec[key] = row[c];
      return rec;
    }, {});
    if (rowData[header[0]]) acc.push(rowData);
    return acc;
  }, []);
};

export const logger = (moduleName) => {
  const _log = (...params) => {
    console.log(`[${moduleName}]:`, ...params);
  };
  return {
    log: (...args) => _log(...args),
  };
};

export const toCamelCase = (str) => {
  return str[0].toLowerCase() + str.slice(1);
};
