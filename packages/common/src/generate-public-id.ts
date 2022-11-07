// import generate = require('nanoid/generate');
import { customAlphabet } from 'nanoid';
/**
 * Generates a random, human-readable string of numbers and upper-case letters
 * for use as public-facing identifiers for things like order or customers.
 *
 * The restriction to only uppercase letters and numbers is intended to make
 * reading and reciting the generated string easier and less error-prone for people.
 * Note that the letters "O" and "I" and number 0 are also omitted because they are easily
 * confused.
 *
 * There is a trade-off between the length of the string and the probability
 * of collisions (the same ID being generated twice). We are using a length of
 * 16, which according to calculations (https://zelark.github.io/nano-id-cc/)
 * would require IDs to be generated at a rate of 1000/hour for 23k years to
 * reach a probability of 1% that a collision would occur.
 */
export function generatePublicId(): string {
  const publicId = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 16);
  return publicId();
}

export function generateCode(size?: number): string {
  const code = customAlphabet('0123456789', size ?? 12);
  return code();
}
// export function generateCode5(): string {
//   const code = customAlphabet('0123456789', 5);
//   return code();
// }
// export function generateCode4(): string {
//     const code = customAlphabet('0123456789', 4);
//     return code();
// }
// export function generateNo(): string {
//   return generateCode()
  // const code = customAlphabet('0123456789', 12);
  // return code();
// }
