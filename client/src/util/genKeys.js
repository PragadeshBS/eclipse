const genKeys = async () => {
  let myKeyPair = await window.crypto.subtle.generateKey(
    {
      name: "ECDH",
      namedCurve: "P-384",
    },
    false,
    ["deriveKey"]
  );
  console.log("key pair generated");
  return myKeyPair;
};

export default genKeys;
