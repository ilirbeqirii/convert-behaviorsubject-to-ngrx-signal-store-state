export function getFromLocalStorage<T>(
  key: string,
): T {
  try {
    return JSON.parse(localStorage.getItem(key) || '');
  } catch (ignored) {
    return JSON.parse('');
  }
}

export function setToLocalStorage(
  key: string,
  payload: any | null | undefined
) {
  if (
    !payload ||
    (payload && typeof payload === 'object' && isEmpty(payload))
  ) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, JSON.stringify(payload));
  }
}


export function isEmpty(obj: any) {
	// Check if the object is null or undefined
  if (obj === null || obj === undefined) {
    return true;
  }

  // Check if the object has any own properties
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false;
    }
  }

  return true;
}

export const i18n = (code: string) => code;
