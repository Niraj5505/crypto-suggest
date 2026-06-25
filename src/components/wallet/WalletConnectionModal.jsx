import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../../contexts/WalletContext';

const WalletConnectionModal = ({ isOpen, onClose }) => {
    const { connectWallet } = useWallet();
    const navigate = useNavigate();
    const [isConnecting, setIsConnecting] = useState(false);
    const [selectedWallet, setSelectedWallet] = useState(null);

    if (!isOpen) return null;

    const walletOptions = [
        {
            id: 'metamask',
            name: 'MetaMask',
            icon: '🦊',
            description: 'Connect with MetaMask wallet'
        },
        {
            id: 'walletconnect',
            name: 'WalletConnect',
            icon: '🔗',
            description: 'Scan with WalletConnect'
        },
        {
            id: 'coinbase',
            name: 'Coinbase Wallet',
            icon: '💼',
            description: 'Connect with Coinbase'
        }
    ];

    const handleConnect = async (walletType) => {
        setSelectedWallet(walletType);
        setIsConnecting(true);

        try {
            const result = await connectWallet(walletType);
            if (result?.success) {
                onClose();
                navigate('/dashboard');
            } else {
                onClose();
            }
        } catch (error) {
            console.error('Connection failed:', error);
        } finally {
            setIsConnecting(false);
            setSelectedWallet(null);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fade-in">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <X className="w-5 h-5 text-gray-500" />
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-text-main mb-3">Connect Wallet</h2>
                    <p className="text-text-muted text-lg">
                        Connect your wallet to submit a review. Browsing is always free.
                    </p>
                </div>

                {/* Wallet Options */}
                <div className="space-y-3">
                    {walletOptions.map((wallet) => (
                        <button
                            key={wallet.id}
                            onClick={() => handleConnect(wallet.name)}
                            disabled={isConnecting}
                            className={`w-full p-4 rounded-xl border-2 transition-all duration-300 ${isConnecting && selectedWallet === wallet.name
                                    ? 'border-primary bg-primary/5 scale-95'
                                    : 'border-gray-200 hover:border-primary hover:bg-primary/5 hover:scale-102'
                                } ${isConnecting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="text-4xl">{wallet.icon}</div>
                                <div className="flex-1 text-left">
                                    <div className="font-bold text-lg text-text-main">{wallet.name}</div>
                                    <div className="text-sm text-text-muted">{wallet.description}</div>
                                </div>
                                {isConnecting && selectedWallet === wallet.name && (
                                    <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                                )}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Footer */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-text-muted">
                        By connecting, you agree to our Terms of Service
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WalletConnectionModal;
