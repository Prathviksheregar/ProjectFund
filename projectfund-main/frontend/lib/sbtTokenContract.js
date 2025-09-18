import { BrowserProvider, Contract } from 'ethers';

const contractABI =  [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "approved",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "Approval",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "operator",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "approved",
          "type": "bool"
        }
      ],
      "name": "ApprovalForAll",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "Transfer",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "applicantCount",
      "outputs": [
        {
          "internalType": "uint128",
          "name": "",
          "type": "uint128"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "applicants",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "applications",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_voterHash",
          "type": "bytes32"
        }
      ],
      "name": "applyForSBT",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "applicant",
          "type": "address"
        },
        {
          "internalType": "uint128",
          "name": "_nullifier",
          "type": "uint128"
        }
      ],
      "name": "approveApplication",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAdminAddress",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint128",
          "name": "index",
          "type": "uint128"
        }
      ],
      "name": "getApplicantByIndex",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getApplicantCount",
      "outputs": [
        {
          "internalType": "uint128",
          "name": "",
          "type": "uint128"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "applicant",
          "type": "address"
        }
      ],
      "name": "getApplicationStatus",
      "outputs": [
        {
          "internalType": "bool",
          "name": "hasApplied",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "isRegistered",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "getApproved",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_address",
          "type": "address"
        }
      ],
      "name": "getNullifierByAddress",
      "outputs": [
        {
          "internalType": "uint128",
          "name": "",
          "type": "uint128"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_address",
          "type": "address"
        }
      ],
      "name": "getTokenIdByAddress",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getVoterCount",
      "outputs": [
        {
          "internalType": "uint128",
          "name": "",
          "type": "uint128"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "operator",
          "type": "address"
        }
      ],
      "name": "isApprovedForAll",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "voter",
          "type": "address"
        }
      ],
      "name": "isRegisteredVoter",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "name",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "ownerOf",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "safeTransferFrom",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "data",
          "type": "bytes"
        }
      ],
      "name": "safeTransferFrom",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "operator",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "approved",
          "type": "bool"
        }
      ],
      "name": "setApprovalForAll",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes4",
          "name": "interfaceId",
          "type": "bytes4"
        }
      ],
      "name": "supportsInterface",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "symbol",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "tokenURI",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "transferFrom",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "voterData",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "voterHash",
          "type": "bytes32"
        },
        {
          "internalType": "bool",
          "name": "isRegistered",
          "type": "bool"
        },
        {
          "internalType": "uint128",
          "name": "nullifier",
          "type": "uint128"
        },
        {
          "internalType": "uint128",
          "name": "tokenId",
          "type": "uint128"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]

// Get contract address from env
const contractAddress = process.env.NEXT_PUBLIC_SBT_CONTRACT;
let cachedContract = null;
let mockContract = null;

// Create a mock contract for development
const createMockContract = async (signer) => {
  if (mockContract) return mockContract;
  
  console.log("Creating mock SBT contract");
  
  // Mock contract implementation
  mockContract = {
    name: async () => "Mock SBT Token",
    symbol: async () => "MSBT",
    applyForSBT: async (voterHash) => {
      console.log("Mock applyForSBT called with hash:", voterHash);
      // Simulate transaction
      return {
        hash: "0x" + Math.random().toString(16).substring(2, 38),
        wait: async () => {
          console.log("Mock transaction confirmed");
          return { status: 1 };
        }
      };
    },
    getApplicationStatus: async (address) => {
      console.log("Mock getApplicationStatus for:", address);
      // Return mock status - has applied but not registered yet
      return { hasApplied: true, isRegistered: false };
    },
    isRegisteredVoter: async (address) => {
      console.log("Mock isRegisteredVoter for:", address);
      return false;
    }
  };
  
  return mockContract;
};

export const getSBTContract = async () => {
  if (typeof window.ethereum === "undefined") {
    throw new Error("Please install MetaMask!");
  }
  
  // Return cached contract if it exists
  if (cachedContract) {
    return cachedContract;
  }
  
  try {
    // Check if we're connected first before requesting accounts
    let accounts = await window.ethereum.request({ method: "eth_accounts" });
    
    // If not connected, request connection
    if (accounts.length === 0) {
      console.log("No accounts connected. Requesting connection...");
      accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    }
    
    console.log("Connected account:", accounts[0]);
    
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    // Check if we're in development mode or if contract address is invalid
    const useRealContract = contractAddress && contractAddress !== "0x46F27CE202dFEa1d7eD6Cc9EA9d4f586352a8e31";
    
    if (useRealContract) {
      console.log("Using real SBT contract at:", contractAddress);
      try {
        cachedContract = new Contract(contractAddress, contractABI, signer);
        
        // Test if contract works
        await cachedContract.name();
        
        console.log("Connected to real SBT contract");
      } catch (error) {
        console.error("Error connecting to real contract:", error);
        console.log("Falling back to mock contract");
        cachedContract = await createMockContract(signer);
      }
    } else {
      console.log("Using mock SBT contract");
      cachedContract = await createMockContract(signer);
    }
    
    // Invalidate cache on network/account change
    window.ethereum.on('chainChanged', () => {
      console.log("Network changed, clearing cache");
      cachedContract = null;
    });
    
    window.ethereum.on('accountsChanged', () => {
      console.log("Account changed, clearing cache");
      cachedContract = null;
    });
    
    return cachedContract;
  } catch (error) {
    console.error("Error initializing SBT contract:", error);
    if (error.code === 4001) {
      throw new Error("User rejected the connection request");
    } else if (error.code === -32002) {
      throw new Error("MetaMask is already processing a request");
    }
    throw error;
  }
};

// Add utility function to check SBT status with caching
const sbtStatusCache = new Map();
export const checkSBTStatus = async (address) => {
  if (!address) return { hasApplied: false, isRegistered: false };

  // Check cache first
  const cacheKey = `${address}-${Date.now()}`;
  if (sbtStatusCache.has(cacheKey)) {
    return sbtStatusCache.get(cacheKey);
  }

  try {
    const contract = await getSBTContract();
    const status = await contract.getApplicationStatus(address);
    
    // Cache for 30 seconds
    sbtStatusCache.set(cacheKey, status);
    setTimeout(() => sbtStatusCache.delete(cacheKey), 30000);
    
    return status;
  } catch (error) {
    console.error("Error checking SBT status:", error);
    return { hasApplied: false, isRegistered: false };
  }
};