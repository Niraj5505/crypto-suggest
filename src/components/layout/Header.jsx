import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronRight, Sparkles, User, LogOut, ChevronDown, UserCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../common/Button';
import ConnectWalletButton from '../wallet/ConnectWalletButton';
import AuthModal from '../auth/AuthModal';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef(null);
    const location = useLocation();
    const { user, logout, isAuthenticated } = useAuth();

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close profile dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
                setProfileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close menus on route change
    useEffect(() => {
        setMobileMenuOpen(false);
        setProfileMenuOpen(false);
    }, [location.pathname]);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Browse', path: '/browse' },
        { name: 'Rankings', path: '/rankings' },
        { name: 'Categories', path: '/categories' },
        { name: 'Bookmarks', path: '/bookmarks' }
    ];

    const avatarUrl = user?.profileImage ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&size=80&background=0D6EFD&color=fff&bold=true`;

    return (
        <>
            {/* Auth Modal */}
            {authModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}

            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                    ? 'bg-white/90 backdrop-blur-xl shadow-lg border-b border-gray-100/50 py-2 sm:py-3'
                    : 'bg-transparent py-3 sm:py-5'
                    }`}
            >
                <div className="container-custom">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link to="/" className="flex items-center group relative z-50">
                            <motion.div transition={{ type: "spring", stiffness: 300 }}>
                                <img src="/logo.png" alt="Crypto Suggest" className="h-8 sm:h-10 w-auto" />
                            </motion.div>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center gap-1 mx-4">
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

                            {/* Auth: Profile dropdown or Login button */}
                            {isAuthenticated ? (
                                <div className="relative" ref={profileMenuRef}>
                                    <button
                                        onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                        className="flex items-center gap-2 h-11 px-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                                        aria-label="Profile menu"
                                    >
                                        <img
                                            src={avatarUrl}
                                            alt={user?.name}
                                            className="w-7 h-7 rounded-full object-cover border-2 border-primary/20"
                                        />
                                        <span className="text-sm font-bold text-gray-800 max-w-[100px] truncate hidden xl:block">
                                            {user?.name}
                                        </span>
                                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${profileMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Profile Dropdown */}
                                    <AnimatePresence>
                                        {profileMenuOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
                                            >
                                                <div className="px-4 py-3 border-b border-gray-100">
                                                    <p className="text-xs text-gray-500 font-semibold">Signed in as</p>
                                                    <p className="text-sm font-bold text-gray-900 truncate">{user?.email}</p>
                                                </div>
                                                <div className="py-1">
                                                    <Link
                                                        to="/profile"
                                                        onClick={() => setProfileMenuOpen(false)}
                                                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors"
                                                    >
                                                        <UserCircle className="w-4 h-4" />
                                                        My Profile
                                                    </Link>
                                                    <button
                                                        onClick={() => { logout(); setProfileMenuOpen(false); }}
                                                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                                                    >
                                                        <LogOut className="w-4 h-4" />
                                                        Logout
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setAuthModalOpen(true)}
                                    className="h-11 px-4 xl:px-5 bg-white border border-gray-200 text-gray-800 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm text-sm flex items-center gap-2"
                                >
                                    <User className="w-4 h-4" />
                                    Login
                                </motion.button>
                            )}

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
                            className="lg:hidden min-w-[44px] min-h-[44px] p-2.5 text-gray-700 bg-white/50 rounded-lg backdrop-blur-sm border border-gray-200 relative z-50 flex items-center justify-center"
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
                            initial={{ opacity: 0, clipPath: "circle(0% at 100% 0%)" }}
                            animate={{ opacity: 1, clipPath: "circle(150% at 100% 0%)" }}
                            exit={{ opacity: 0, clipPath: "circle(0% at 100% 0%)" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed inset-0 top-0 z-40 bg-white lg:hidden flex flex-col pt-20 sm:pt-24 px-4 sm:px-6"
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

                                {/* Mobile Auth */}
                                {isAuthenticated ? (
                                    <div className="space-y-2">
                                        <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                                            <Button className="w-full justify-center min-h-[56px] h-14 text-base font-bold bg-white border border-gray-200 text-gray-800">
                                                <UserCircle className="w-5 h-5 mr-2" />
                                                My Profile ({user?.name})
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            onClick={() => { logout(); setMobileMenuOpen(false); }}
                                            className="w-full justify-center min-h-[56px] h-14 text-base font-bold text-red-500 hover:bg-red-50"
                                        >
                                            Logout
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        onClick={() => { setAuthModalOpen(true); setMobileMenuOpen(false); }}
                                        className="w-full justify-center min-h-[56px] h-14 text-base font-bold bg-white border border-gray-200 text-gray-800"
                                    >
                                        <User className="w-5 h-5 mr-2" />
                                        Login / Register
                                    </Button>
                                )}

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
