import { atom, DefaultValue, selector } from "recoil";
import { clearName, setName } from "../util/user";

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

    // initial page load, pull from local storage
    const localStorageName = localStorage.getItem("name");
    return localStorageName ?? "";
  },
  set: ({ set }, name) => {
    set(nameAtom, name);
    if (name instanceof DefaultValue || name === "") {
      clearName();
    } else {
      setName(name);
    }
  },
});
