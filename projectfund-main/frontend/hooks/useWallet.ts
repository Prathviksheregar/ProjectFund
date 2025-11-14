'use client';

import { useState, useEffect, useCallback } from 'react';
import { getPublicFundingContract } from '@/lib/publicFundingContract';
import { useSBT } from './useSBT';
import { debounce } from 'lodash';

// Cache for roles to prevent unnecessary contract calls
const rolesCache = new Map();

export function useWallet() {
  const [account, setAccount] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthority, setIsAuthority] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  
  // Get SBT status using the new hook
  const { isRegistered: isSBTHolder, hasApplied: hasSBTApplication } = useSBT(account);
  
  const connectWalletManually = async () => {
    setIsConnecting(true);
    
    try {
      if (typeof window === 'undefined' || typeof window.ethereum === 'undefined') {
        console.log("MetaMask not detected");
        alert("MetaMask is not installed. Please install MetaMask to connect your wallet.");
        setIsConnecting(false);
        return;
      }

      console.log("Requesting accounts...");
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      console.log("Received accounts:", accounts);
      
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        await checkRoles(accounts[0]);
      }
    } catch (err: any) {
      console.error("Error connecting to wallet:", err);
      if (err.code === 4001) {
        alert("Connection rejected. Please connect to MetaMask.");
      } else {
        alert(`Error connecting wallet: ${err.message || err}`);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const checkRoles = useCallback(async (address: string) => {
    if (!address) return;

    // Check cache first
    const cacheKey = `${address}-roles`;
    const cachedRoles = rolesCache.get(cacheKey);
    if (cachedRoles) {
      setIsAdmin(cachedRoles.isAdmin);
      setIsAuthority(cachedRoles.isAuthority);
      return;
    }

  // Hardcoded admin address check for development (include extra dev admin)
  const ADMIN_ADDRESS = '0x46F27CE202dFEa1d7eD6Cc9EA9d4f586352a8e31';
  const EXTRA_ADMIN = '0x77a9880fc1637d02e988049c3057ddf9fa43119b';
  const isHardcodedAdmin = address.toLowerCase() === ADMIN_ADDRESS.toLowerCase() || address.toLowerCase() === EXTRA_ADMIN.toLowerCase();

    try {
      const contract = await getPublicFundingContract();
      const adminAddress = await contract.admin();
      const isAuth = await contract.authorities(address);

      // Treat the requested authority address as authority in dev (non-destructive)
      const EXTRA_AUTHORITY = '0x8ffb13e194414c545870f8bd2feeedd1d47f5fec';
      const isHardcodedAuthority = address.toLowerCase() === EXTRA_AUTHORITY.toLowerCase();

      const roles = {
        isAdmin: isHardcodedAdmin || adminAddress.toLowerCase() === address.toLowerCase(),
        isAuthority: Boolean(isAuth) || isHardcodedAuthority
      };

      // Cache the roles for 5 minutes
      rolesCache.set(cacheKey, roles);
      setTimeout(() => rolesCache.delete(cacheKey), 5 * 60 * 1000);

      setIsAdmin(roles.isAdmin);
      setIsAuthority(roles.isAuthority);
    } catch (err: any) {
      console.error("Error checking roles:", err);
      // Fallback to hardcoded admin in case of contract error
      const roles = {
        isAdmin: isHardcodedAdmin,
        isAuthority: false
      };
      setIsAdmin(roles.isAdmin);
      setIsAuthority(roles.isAuthority);
    }
  }, []);

  // Debounce the roles check to prevent too many calls
  const debouncedCheckRoles = useCallback(
    debounce((address: string) => checkRoles(address), 1000),
    [checkRoles]
  );

  useEffect(() => {
    const connectWallet = async () => {
      setIsConnecting(true);
      
      if (typeof window === 'undefined' || typeof window.ethereum === 'undefined') {
        console.log("MetaMask not detected");
        setIsConnecting(false);
        return;
      }

      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          await checkRoles(accounts[0]);
        }
      } catch (err: any) {
        console.error("Error connecting to wallet:", err);
      } finally {
        setIsConnecting(false);
      }
    };

    connectWallet();

    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          debouncedCheckRoles(accounts[0]);
        } else {
          setAccount('');
          setIsAdmin(false);
          setIsAuthority(false);
        }
      };

      const handleChainChanged = () => {
        // Clear caches on chain change
        rolesCache.clear();
        // Reload the page when chain changes
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        debouncedCheckRoles.cancel();
      };
    }
  }, [checkRoles, debouncedCheckRoles]);

  return { 
    account, 
    isAdmin, 
    isAuthority, 
    isConnecting,
    isSBTHolder,
    hasSBTApplication,
    connectWallet: connectWalletManually
  };
}