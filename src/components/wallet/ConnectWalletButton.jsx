import React, { useState } from 'react';
import { ChevronDown, Copy, LogOut, Check, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWallet } from '../../contexts/WalletContext';
import WalletConnectionModal from './WalletConnectionModal';

const ConnectWalletButton = ({ className = "" }) => {
    const { isConnected, walletAddress, getTruncatedAddress, disconnectWallet } = useWallet();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopyAddress = () => {
        if (walletAddress) {
            navigator.clipboard.writeText(walletAddress);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDisconnect = () => {
        disconnectWallet();
        setIsDropdownOpen(false);
    };

    if (!isConnected) {
        return (
            <>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className={`px-5 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${className}`}
                >
                    Connect Wallet
                </button>
                <WalletConnectionModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            </>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-6 py-3 bg-green-50 border-2 border-green-200 text-green-700 font-semibold rounded-xl hover:bg-green-100 transition-all duration-300"
            >
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>{getTruncatedAddress()}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-20 animate-fade-in">
                        <div className="p-4 border-b border-gray-100">
                            <div className="text-xs text-text-muted mb-1">Connected Wallet</div>
                            <div className="font-mono text-sm text-text-main break-all">
                                {getTruncatedAddress()}
                            </div>
                        </div>

                        <Link
                            to="/dashboard"
                            onClick={() => setIsDropdownOpen(false)}
                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-blue-50 transition-colors text-left"
                        >
                            <LayoutDashboard className="w-4 h-4 text-primary" />
                            <span className="text-primary font-semibold">My Dashboard</span>
                        </Link>

                        <button
                            onClick={handleCopyAddress}
                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-4 h-4 text-green-600" />
                                    <span className="text-green-600 font-medium">Copied!</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4 text-text-muted" />
                                    <span className="text-text-main">Copy Address</span>
                                </>
                            )}
                        </button>

                        <button
                            onClick={handleDisconnect}
                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-50 transition-colors text-left border-t border-gray-100"
                        >
                            <LogOut className="w-4 h-4 text-red-600" />
                            <span className="text-red-600 font-medium">Disconnect</span>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ConnectWalletButton;
