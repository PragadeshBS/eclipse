function getMessageEncoding(msg) {
  let enc = new TextEncoder();
  return enc.encode(msg);
}

export async function encrypt(msg, secretKey) {
  let encoded = getMessageEncoding(msg);
  let iv = window.crypto.getRandomValues(new Uint8Array(12));

  let ciphertext = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    secretKey,
    encoded
  );
  return { ciphertext, iv };
}

export async function decrypt(ciphertext, iv, secretKey) {
  try {
    let decrypted = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      secretKey,
      ciphertext
    );
    let dec = new TextDecoder();
    return dec.decode(decrypted);
  } catch (err) {
    console.log(err);
  }
}
