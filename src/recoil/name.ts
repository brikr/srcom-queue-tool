import { atom, DefaultValue, selector } from "recoil";

const nameAtom = atom<string>({
  key: "nameAtom",
  default: "",
});

export const nameSelector = selector<string>({
  key: "nameSelector",
  get: ({ get }) => {
    const name = get(nameAtom);

    if (name) {
      return name;
    }

    const localStorageName = localStorage.getItem("name");
    return localStorageName ?? "";
  },
  set: ({ set }, name) => {
    set(nameAtom, name);
    if (name instanceof DefaultValue) {
      localStorage.removeItem("name");
    } else {
      localStorage.setItem("name", name);
    }
  },
});
