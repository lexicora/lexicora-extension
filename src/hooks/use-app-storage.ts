import { useState, useEffect } from "react";
import type { WxtStorageItem } from "wxt/utils/storage";

export function useAppStorage<T>(storageItem: WxtStorageItem<T, any>) {
  const [value, setValue] = useState<T | undefined>(undefined);

  useEffect(() => {
    // Initial Load
    storageItem.getValue().then((val) => setValue(val));

    // Watch for changes (Cross-context sync)
    return storageItem.watch((newValue) => {
      setValue(newValue);
    });
  }, [storageItem]);

  const updateValue = async (newValue: T) => {
    setValue(newValue); // Optimistic Update
    await storageItem.setValue(newValue);
  };

  return [value, updateValue] as const;
}
