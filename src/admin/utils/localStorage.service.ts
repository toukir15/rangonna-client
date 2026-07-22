/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
interface ILocalStorageService {
  remove(ACCESS_TOKEN: string): unknown;
  set: (key: string, value: any) => void;
  get: any;
  delete: any;
  clear: any;
}

export const LocalStorageService: ILocalStorageService = {
  set: (key: string, value: any): void =>
    localStorage.setItem(key, JSON.stringify(value)),
  get: (key: any): any => {
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);
    return null;
  },
  delete: (key: string): void => localStorage.removeItem(key),
  clear: (): void => localStorage.clear(),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  remove: function (ACCESS_TOKEN: string): unknown {
    throw new Error("Function not implemented.");
  },
};
