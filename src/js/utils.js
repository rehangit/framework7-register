export const logger = (moduleName) => {
  const _log = (...params) => {
    console.log(`[${moduleName}]:`, ...params);
  };
  return {
    log: (...args) => _log(...args),
  };
};

const { log } = logger('utils');
export const dateToSerial = (date) => {
  const startOfDay = new Date(new Date(date).toISOString().slice(0, 10));
  const serial = Math.floor((startOfDay - new Date('1899-12-30')) / (1000 * 3600 * 24));
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

export const serialToDate = (serial) => new Date((Math.floor(serial) - 25569) * 86400 * 1000);

export const serialToTimestamp = (serial) => new Date((serial - 25569.0) * 86400 * 1000);

const typeConverters = {
  serialToDate,
  dateToSerial,
};
export const toJson = (table, types = {}) => {
  if (table.length < 1) return {};

  const header = table[0];
  return table.slice(1).reduce((acc, row) => {
    const rowData = header.reduce((rec, key, c) => {
      const fn = types[key];
      const conv = fn ? (typeof fn === 'function' ? fn : typeConverters[fn]) : (a) => a;
      const value = conv(row[c]);
      rec[key] = value;
      return rec;
    }, {});
    if (rowData[header[0]]) acc.push(rowData);
    return acc;
  }, []);
};

export const toIndexed = (arrayOfObjects = [], index) => {
  const name = index || (arrayOfObjects.length && Object.keys(arrayOfObjects[0])[0]);
  return arrayOfObjects.reduce((acc, rec) => {
    const id = rec[name];
    acc[id] = rec;
    return acc;
  }, {});
};

export const toCamelCase = (str) => {
  const [first, ...words] = str.split(' ');
  return [
    first[0].toLowerCase(),
    first.slice(1),
    ...words.map((w) => w[0].toUpperCase() + w.slice(1)),
  ].join('');
};

export const getCached = async (name, expiryDuration, fn) => {
  const cached = JSON.parse(window.localStorage.getItem(name) || '{}') || null;
  if (
    (cached &&
      cached.expiry &&
      cached.data &&
      expiryDuration > 0 &&
      cached.expiry > new Date().getTime()) ||
    !fn
  ) {
    log(`getCached for '${name}' returning from localStorage: ${cached?.data?.length} items`);
    return cached?.data || null;
  }

  const data = await fn();
  log(`received data from '${name}' from calling fn`, data);

  if (data) {
    window.localStorage.setItem(
      name,
      JSON.stringify({
        expiry: new Date().getTime() + (expiryDuration || cached?.expiry || 60000),
        data,
      })
    );
  }
  return data;
};
