import React, { createContext, useContext, useState, useEffect } from 'react';

const WalletContext = createContext(null);

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within WalletProvider');
    }
    return context;
};

export const WalletProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState(null);
    const [walletType, setWalletType] = useState(null);
    const [connectedAt, setConnectedAt] = useState(null);

    // Check if wallet is already connected on load
    useEffect(() => {
        const checkWalletConnected = async () => {
            if (window.ethereum) {
                try {
                    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                    if (accounts.length > 0) {
                        setIsConnected(true);
                        setWalletAddress(accounts[0]);
                        setWalletType('MetaMask');
                        
                        const savedConnection = localStorage.getItem('walletConnection');
                        if (savedConnection) {
                            try {
                                const connection = JSON.parse(savedConnection);
                                setConnectedAt(connection.connectedAt);
                            } catch (e) {
                                setConnectedAt(Date.now());
                            }
                        } else {
                            setConnectedAt(Date.now());
                        }
                    }
                } catch (error) {
                    console.error('Error checking wallet connection:', error);
                }
            }
        };
        checkWalletConnected();
    }, []);

    // Listen for accountsChanged and disconnect events
    useEffect(() => {
        if (window.ethereum) {
            const handleAccountsChanged = (accounts) => {
                if (accounts.length > 0) {
                    setIsConnected(true);
                    setWalletAddress(accounts[0]);
                    setWalletType('MetaMask');
                    
                    const connection = {
                        isConnected: true,
                        address: accounts[0],
                        type: 'MetaMask',
                        connectedAt: Date.now()
                    };
                    localStorage.setItem('walletConnection', JSON.stringify(connection));
                } else {
                    disconnectWallet();
                }
            };

            window.ethereum.on('accountsChanged', handleAccountsChanged);

            return () => {
                if (window.ethereum.removeListener) {
                    window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                }
            };
        }
    }, []);

    // Connect wallet using window.ethereum
    const connectWallet = async (type = 'MetaMask') => {
        if (!window.ethereum) {
            alert('🦊 MetaMask not detected! Please install MetaMask extension to connect your wallet.');
            return { success: false, error: 'No provider' };
        }

        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            if (accounts.length > 0) {
                const address = accounts[0];
                const timestamp = Date.now();

                setIsConnected(true);
                setWalletAddress(address);
                setWalletType(type);
                setConnectedAt(timestamp);

                const connection = {
                    isConnected: true,
                    address,
                    type,
                    connectedAt: timestamp
                };
                localStorage.setItem('walletConnection', JSON.stringify(connection));

                return { success: true, address };
            }
            return { success: false, error: 'No accounts' };
        } catch (error) {
            console.error('Failed to connect wallet:', error);
            alert(`❌ Failed to connect wallet: ${error.message}`);
            return { success: false, error: error.message };
        }
    };

    // Disconnect wallet
    const disconnectWallet = () => {
        setIsConnected(false);
        setWalletAddress(null);
        setWalletType(null);
        setConnectedAt(null);
        localStorage.removeItem('walletConnection');
    };

    // Get truncated address for display
    const getTruncatedAddress = () => {
        if (!walletAddress) return '';
        return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
    };

    const value = {
        isConnected,
        walletAddress,
        walletType,
        connectedAt,
        connectWallet,
        disconnectWallet,
        getTruncatedAddress
    };

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
};
