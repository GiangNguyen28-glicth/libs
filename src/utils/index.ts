import _, { isArray, isPlainObject } from 'lodash';
export const flattenKeys = (obj: object, currentPath: string) => {
  let paths = [];

  for (const k in obj) {
    if (isPlainObject(obj[k]) || Array.isArray(obj[k])) {
      paths = paths.concat(
        flattenKeys(obj[k], currentPath ? `${currentPath}.${k}` : k),
      );
    } else {
      paths.push(currentPath ? `${currentPath}.${k}` : k);
    }
  }

  return paths;
};

export const toArray = <T>(data: T | Array<T>): T[] => {
  if (!data) return [];
  return isArray(data) ? data : [data];
};
