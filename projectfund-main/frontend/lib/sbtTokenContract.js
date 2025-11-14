import { BrowserProvider, Contract } from 'ethers';

// Local constants to avoid referencing ethers.* constants (keeps mock self-contained)
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const ZERO_HASH = '0x' + '0'.repeat(64);

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

// Mock storage for persistent state across page reloads
const MOCK_STORAGE_KEY = 'mockSBTData';
const getMockStorage = () => {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(MOCK_STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
};

const setMockStorage = (data) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Could not save to localStorage:', error);
  }
};

// Create a mock contract for development
const createMockContract = async (signer) => {
  if (mockContract) return mockContract;
  
  console.log("Creating mock SBT contract for development/testing");
  
  // Admin address with automatic 1000 SBT tokens
  const ADMIN_ADDRESS = '0x46F27CE202dFEa1d7eD6Cc9EA9d4f586352a8e31';
  // Additional dev admin (non-destructive)
  const EXTRA_ADMIN_ADDRESS = '0x77a9880fc1637d02e988049c3057ddf9fa43119b';
  
  // Initialize admin data if not exists
  const initializeAdminData = () => {
    const mockData = getMockStorage();
    if (!mockData[ADMIN_ADDRESS]) {
      mockData[ADMIN_ADDRESS] = {
        hasApplied: true,
        isRegistered: true,
        tokenId: 1000, // Admin gets token ID 1000
        nullifier: 999999,
        voterHash: "0x" + "admin".padEnd(64, '0'),
        applicationDate: new Date().toISOString(),
        isAdmin: true
      };
      setMockStorage(mockData);
      console.log("Admin address automatically configured with SBT tokens");
    }
    // Also seed the extra admin address if not present (non-destructive)
    if (!mockData[EXTRA_ADMIN_ADDRESS]) {
      mockData[EXTRA_ADMIN_ADDRESS] = {
        hasApplied: true,
        isRegistered: true,
        tokenId: 1001, // Extra admin gets token ID 1001
        nullifier: 999998,
        voterHash: "0x" + "extraadmin".padEnd(64, '0'),
        applicationDate: new Date().toISOString(),
        isAdmin: true
      };
      setMockStorage(mockData);
      console.log(`Extra admin ${EXTRA_ADMIN_ADDRESS} configured with SBT tokens`);
    }
  };
  
  // Initialize admin on contract creation
  initializeAdminData();
  
  // Initialize a default authority in mock storage (non-destructive)
  const initializeAuthorityData = () => {
    const AUTH_ADDRESS = '0x8ffb13e194414c545870f8bd2feeedd1d47f5fec';
    const mockData = getMockStorage();
    const key = AUTH_ADDRESS;
    if (!mockData[key]) mockData[key] = {};
    // set authority flag without removing any existing fields
    mockData[key].isAuthority = true;
    mockData[key].authoritySince = mockData[key].authoritySince || new Date().toISOString();
    setMockStorage(mockData);
    console.log(`Initialized authority mock data for ${AUTH_ADDRESS}`);
  };
  initializeAuthorityData();
  
  // Create test applications for demo purposes
  const createTestApplicationsIfNeeded = () => {
    const mockData = getMockStorage();
    const hasTestApps = Object.keys(mockData).some(addr => addr.startsWith('0x1234') || addr.startsWith('0xABCD'));
    
    if (!hasTestApps) {
      const testAddresses = [
        '0x1234567890123456789012345678901234567890',
        '0xABCDEF1234567890ABCDEF1234567890ABCDEF12', 
        '0x9876543210987654321098765432109876543210'
      ];
      
      testAddresses.forEach((address, index) => {
        mockData[address] = {
          hasApplied: true,
          isRegistered: false,
          voterHash: "0x" + `test${index}`.padEnd(64, '0'),
          applicationDate: new Date().toISOString()
        };
      });
      
      setMockStorage(mockData);
      console.log("Created test SBT applications for admin to approve");
    }
  };
  
  createTestApplicationsIfNeeded();
  
  // Mock contract implementation with persistent storage
  mockContract = {
    name: async () => "Mock SBT Token",
    symbol: async () => "MSBT",
    
    applyForSBT: async (voterHash) => {
      console.log("Mock applyForSBT called with hash:", voterHash);
      
      const signerAddress = await signer.getAddress();
      const mockData = getMockStorage();
      
      // Store application data
      if (!mockData[signerAddress]) {
        mockData[signerAddress] = {};
      }
      
      mockData[signerAddress].hasApplied = true;
      mockData[signerAddress].voterHash = voterHash;
      mockData[signerAddress].applicationDate = new Date().toISOString();
      
      setMockStorage(mockData);
      
      // Simulate transaction
      return {
        hash: "0x" + Math.random().toString(16).substring(2, 38),
        wait: async () => {
          console.log("Mock SBT application transaction confirmed");
          return { status: 1 };
        }
      };
    },
    
    getApplicationStatus: async (address) => {
      console.log("Mock getApplicationStatus for:", address);
      
      // Always initialize admin data
      initializeAdminData();
      
      const mockData = getMockStorage();
      const userData = mockData[address] || {};
      
      return { 
        hasApplied: userData.hasApplied || false, 
        isRegistered: userData.isRegistered || false 
      };
    },
    
    isRegisteredVoter: async (address) => {
      console.log("Mock isRegisteredVoter for:", address);
      
      // Always initialize admin data
      initializeAdminData();
      
      const mockData = getMockStorage();
      const userData = mockData[address] || {};
      return userData.isRegistered || false;
    },
    
    getTokenIdByAddress: async (address) => {
      console.log("Mock getTokenIdByAddress for:", address);
      
      // Always initialize admin data
      initializeAdminData();
      
      const mockData = getMockStorage();
      const userData = mockData[address] || {};
      return userData.tokenId || 0;
    },
    
    getApplicantCount: async () => {
      const mockData = getMockStorage();
      // Only count applications that haven't been approved yet
      return Number(Object.values(mockData).filter(data => data.hasApplied && !data.isRegistered).length);
    },
    
    getVoterCount: async () => {
      const mockData = getMockStorage();
      return Object.values(mockData).filter(data => data.isRegistered).length;
    },
    
    getApplicantByIndex: async (index) => {
      console.log("Mock getApplicantByIndex for index:", index);
      const mockData = getMockStorage();
      const applicants = Object.keys(mockData).filter(address => 
        mockData[address].hasApplied && !mockData[address].isRegistered
      );
      const addr = applicants[Number(index)];
      return addr ? String(addr) : ZERO_ADDRESS;
    },
    
    applications: async (address) => {
      console.log("Mock applications for:", address);
      const mockData = getMockStorage();
      const userData = mockData[address] || {};
      if (userData.hasApplied && !userData.isRegistered) {
        return userData.voterHash || "0x" + "pending".padEnd(64, '0');
      }
      return ZERO_HASH;
    },
    
    // Admin function to approve applications (for testing)
    approveApplication: async (applicantAddress, nullifier) => {
      console.log("Mock approveApplication for:", applicantAddress);
      const mockData = getMockStorage();
      
      if (mockData[applicantAddress] && mockData[applicantAddress].hasApplied) {
        mockData[applicantAddress].isRegistered = true;
        mockData[applicantAddress].tokenId = Date.now(); // Simple token ID
        mockData[applicantAddress].nullifier = nullifier;
        setMockStorage(mockData);
        
        return {
          hash: "0x" + Math.random().toString(16).substring(2, 38),
          wait: async () => {
            console.log("Mock approval transaction confirmed");
            return { status: 1 };
          }
        };
      }
      throw new Error("No application found for this address");
    },
    
    // Helper function to create test applications for demo
    createTestApplications: () => {
      const mockData = getMockStorage();
      const testAddresses = [
        '0x1234567890123456789012345678901234567890',
        '0xABCDEF1234567890ABCDEF1234567890ABCDEF12',
        '0x9876543210987654321098765432109876543210'
      ];
      
      testAddresses.forEach((address, index) => {
        if (!mockData[address]) {
          mockData[address] = {
            hasApplied: true,
            isRegistered: false,
            voterHash: "0x" + `test${index}`.padEnd(64, '0'),
            applicationDate: new Date().toISOString()
          };
        }
      });
      
      setMockStorage(mockData);
      console.log("Created test SBT applications for admin to approve");
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

  // Use address as cache key and cache for 30 seconds
  const cacheKey = String(address).toLowerCase();
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