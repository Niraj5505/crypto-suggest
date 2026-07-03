import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../common/Button';
import ConnectWalletButton from '../wallet/ConnectWalletButton';
import logoSrc from '../../assets/logo.png';

const Header = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close menus on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Browse', path: '/browse' },
        { name: 'Rankings', path: '/rankings' },
        { name: 'Categories', path: '/categories' },
        { name: 'Bookmarks', path: '/bookmarks' }
    ];

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 transition-all duration-300 ${
                    mobileMenuOpen
                        ? 'z-[9999] bg-white shadow-none py-2'
                        : scrolled
                            ? 'z-50 bg-white/90 backdrop-blur-xl shadow-lg border-b border-gray-100/50 py-2 sm:py-3'
                            : 'z-50 bg-transparent py-3 sm:py-5'
                }`}
            >
                <div className="container-custom">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2.5 group relative z-[110] select-none">
                            <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
                                {/* Brand Logo */}
                                <img src={logoSrc} alt="Crypto Suggest Logo" className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 object-contain" />
                            </motion.div>
                            {/* Wordmark */}
                            <span className="text-[15px] sm:text-[17px] font-black tracking-widest uppercase leading-none" style={{ color: '#1e3a5f', letterSpacing: '0.12em' }}>
                                Crypto<span className="text-blue-500"> Suggest</span>
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center gap-1 mx-8">
                            {navLinks.map(link => {
                                const isActive = location.pathname === link.path;
                                return (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className="relative px-3 xl:px-4 py-2 text-sm font-bold transition-colors group"
                                    >
                                        <span className={`relative z-10 transition-colors ${isActive ? 'text-primary' : 'text-gray-600 hover:text-gray-900'}`}>
                                            {link.name}
                                        </span>
                                        {isActive && (
                                            <motion.div
                                                layoutId="nav-indicator"
                                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full mx-3 xl:mx-4"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        <span className="absolute inset-0 bg-gray-50 rounded-lg scale-0 group-hover:scale-100 transition-transform -z-10 origin-center duration-200 opacity-50"></span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Right Side Actions */}
                        <div className="hidden lg:flex items-center gap-2 xl:gap-3">
                            <ConnectWalletButton className="!h-11 !px-4 xl:!px-6 !py-0 flex items-center justify-center bg-gray-900 hover:bg-black text-white shadow-none border-0 text-sm" />

                            <Link to="/submit">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="h-11 px-4 xl:px-6 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all flex items-center gap-2 text-sm"
                                >
                                    <Sparkles className="w-4 h-4 fill-current opacity-80" />
                                    <span className="hidden xl:inline">Submit Website</span>
                                    <span className="xl:hidden">Submit</span>
                                </motion.button>
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden min-w-[44px] min-h-[44px] p-2.5 text-gray-700 bg-white/50 rounded-lg backdrop-blur-sm border border-gray-200 relative z-[110] flex items-center justify-center"
                            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </motion.button>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="fixed inset-0 top-0 z-[100] bg-white lg:hidden flex flex-col pt-20 sm:pt-24 px-4 sm:px-6 overflow-y-auto"
                        >
                            <nav className="flex flex-col gap-2 sm:gap-4">
                                {navLinks.map((link, i) => (
                                    <motion.div
                                        key={link.path}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                    >
                                        <Link
                                            to={link.path}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`flex items-center justify-between min-h-[56px] p-4 rounded-xl sm:rounded-2xl text-lg sm:text-xl font-bold transition-all ${location.pathname === link.path
                                                ? 'bg-blue-50 text-primary'
                                                : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            {link.name}
                                            {location.pathname === link.path && <ChevronRight className="w-5 h-5" />}
                                        </Link>
                                    </motion.div>
                                ))}
                            </nav>

                            <div className="mt-auto mb-6 sm:mb-10 space-y-3 sm:space-y-4">
                                <ConnectWalletButton className="w-full justify-center min-h-[56px] h-14 text-base sm:text-lg" />

                                <Link to="/submit" onClick={() => setMobileMenuOpen(false)} className="block">
                                    <Button className="w-full justify-center min-h-[56px] h-14 text-base sm:text-lg bg-gray-900 hover:bg-black text-white">
                                        Submit Your Website
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>
        </>
    );
};

export default Header;
