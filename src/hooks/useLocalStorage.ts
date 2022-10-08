import { useState } from "react";

export function useLocalStorage(key: string, defaultValue: string) {
  let value = localStorage.getItem(key);

  if (value === null) {
    value = defaultValue;
    localStorage.setItem(key, defaultValue);
  }

  const [stateValue, setStateValue] = useState(value);

  function setter(newValue: string) {
    setStateValue(newValue);

    localStorage.setItem(key, newValue);
  }

  return [stateValue, setter] as const;
}
