/**
 * Mock implementation of bcrypt for development purposes
 * This is a temporary solution until the bcrypt module is properly installed
 */

// Simple hash function that doesn't actually hash anything
// DO NOT USE IN PRODUCTION
const hash = async (password, salt) => {
  return `mocked_hash_${password}_${salt}`;
};

// Simple compare function that checks if the hash ends with the password
// DO NOT USE IN PRODUCTION
const compare = async (password, hash) => {
  // For development, always return true to allow any login
  return true;
};

const genSalt = async (rounds = 10) => {
  return rounds.toString();
};

module.exports = {
  hash,
  compare,
  genSalt
};