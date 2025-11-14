// Load .env from this folder explicitly and override any pre-set env vars
const dotenv = require("dotenv");
const envResult = dotenv.config({ path: __dirname + "/.env", override: true });
try {
  console.log("[hardhat.config] dotenv parsed SEPOLIA_RPC_URL=", envResult && envResult.parsed ? (envResult.parsed.SEPOLIA_RPC_URL ? envResult.parsed.SEPOLIA_RPC_URL.substring(0,45) + '...' : 'undefined') : 'no parsed');
} catch {}
require("@nomiclabs/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");
require("hardhat-circom");

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
// Debug log to confirm which RPC URL is being used at runtime
try {
  const shown = SEPOLIA_RPC_URL ? `${SEPOLIA_RPC_URL.substring(0, 45)}...` : 'undefined';
  console.log(`[hardhat.config] SEPOLIA_RPC_URL=`, shown);
} catch {}
// Normalize private key to include 0x prefix if missing
const NORMALIZED_PK = PRIVATE_KEY
  ? (PRIVATE_KEY.startsWith("0x") ? PRIVATE_KEY : `0x${PRIVATE_KEY}`)
  : undefined;

module.exports = {
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true, // Enable viaIR
    },
  },
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: NORMALIZED_PK ? [NORMALIZED_PK] : [],
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
  },
  circom: {
    inputBasePath: "./circuits",
    outputBasePath: "./build/circuits",
    ptau: "path/to/your/ptau/file",
    circuits: [
      {
        name: "verifier",
        protocol: "groth16"
      }
    ]
  }
};