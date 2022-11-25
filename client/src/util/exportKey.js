async function exportCryptoKey(key) {
  const exported = await window.crypto.subtle.exportKey("raw", key);
  const exportedKeyBuffer = new Uint8Array(exported);
  return exportedKeyBuffer;
}

export default exportCryptoKey;
