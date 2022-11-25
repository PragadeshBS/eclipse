function importSecretKey(rawKey) {
  return window.crypto.subtle.importKey(
    "raw",
    rawKey,
    {
      name: "ECDH",
      namedCurve: "P-384",
    },
    false,
    ["deriveKey"]
  );
}

export default importSecretKey;
