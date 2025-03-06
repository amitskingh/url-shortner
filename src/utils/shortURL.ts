const BASE62_ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const BASE = 62;

function encodeBase62(num: number): string {
  let result = "";
  while (num > 0) {
    result = BASE62_ALPHABET[num % BASE] + result;
    num = Math.floor(num / BASE);
  }

  return result;
}

function decodeBase62(encoded: string): number {
  let num = 0;
  for (let i = 0; i < encoded.length; i++) {
    num = num * BASE + BASE62_ALPHABET.indexOf(encoded[i]);
  }

  return num;
}

export { encodeBase62, decodeBase62 };
