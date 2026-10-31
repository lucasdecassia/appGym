export const newId = (prefix = "id", now = Date.now(), random = Math.random) =>
  `${prefix}_${now.toString(36)}${Math.floor(random() * 1e6).toString(36)}`;
