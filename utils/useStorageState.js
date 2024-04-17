import * as SecureStore from 'expo-secure-store';
import * as React from 'react';

function useAsyncState(initialValue = [true, undefined]) {
  return React.useReducer(
    (state, action = null) => [false, action],
    initialValue
  )
}

export async function setStorageItemAsync(key, value) {
  if (value == null) {
    await SecureStore.deleteItemAsync(key);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

export function useStorageState(key) {
  // Public
  const [state, setState] = useAsyncState();

  // Get
  React.useEffect(() => {
    SecureStore.getItemAsync(key).then(value => {
      setState(value);
    })
  }, [key]);

  // Set
  const setValue = React.useCallback(
    (value) => {
      setStorageItemAsync(key, value).then(() => {
        setState(value);
      });
    },
    [key]
  );

  return [state, setValue];
}
