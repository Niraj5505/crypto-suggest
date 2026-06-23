import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Facebook, Instagram, Mail } from 'lucide-react';

const Footer = () => {
    const categories = [
        { name: 'Crypto Exchanges', path: '/category/crypto-exchanges' },
        { name: 'NFT Marketplaces', path: '/category/nft-marketplaces' },
        { name: 'Crypto Wallets', path: '/category/crypto-wallets' },
        { name: 'DeFi Platforms', path: '/category/defi-platforms' },
        { name: 'Blockchain Explorers', path: '/category/blockchain-explorers' },
        { name: 'Crypto News', path: '/category/crypto-news-media' }
    ];

    return (
        <footer className="bg-primary-dark text-white">
            <div className="container-custom py-8 sm:py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                    {/* About */}
                    <div>
                        <h4 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 text-accent">About Crypto Suggest</h4>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Your trusted directory for discovering verified crypto websites. We help users find reliable crypto platforms and give website owners visibility.
                        </p>
                    </div>

                    {/* Categories */}
                    <div>
                        <h4 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 text-accent">Popular Categories</h4>
                        <ul className="space-y-2">
                            {categories.map(cat => (
                                <li key={cat.path}>
                                    <Link to={cat.path} className="text-white/70 hover:text-accent text-sm transition-colors inline-block py-1">
                                        {cat.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* For Website Owners */}
                    <div>
                        <h4 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 text-accent">For Website Owners</h4>
                        <ul className="space-y-2">
                            <li><Link to="/submit" className="text-white/70 hover:text-accent text-sm transition-colors inline-block py-1">Submit Website</Link></li>
                            <li><Link to="/contact" className="text-white/70 hover:text-accent text-sm transition-colors inline-block py-1">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 text-accent">Resources</h4>
                        <ul className="space-y-2">
                            <li><Link to="/rankings" className="text-white/70 hover:text-accent text-sm transition-colors inline-block py-1">Leaderboards & Rankings</Link></li>
                            <li><Link to="/about" className="text-white/70 hover:text-accent text-sm transition-colors inline-block py-1">About Us</Link></li>
                            <li><Link to="/contact" className="text-white/70 hover:text-accent text-sm transition-colors inline-block py-1">FAQ</Link></li>
                        </ul>

                        {/* Social Media */}
                        <div className="mt-4 sm:mt-6">
                            <h5 className="font-semibold mb-3 text-sm sm:text-base">Follow Us</h5>
                            <div className="flex gap-2 sm:gap-3">
                                <a href="#" className="min-w-[44px] min-h-[44px] p-2.5 bg-white/10 hover:bg-accent/20 rounded-lg transition-all hover:scale-110 flex items-center justify-center" aria-label="Twitter">
                                    <Twitter className="w-5 h-5 text-white hover:text-accent transition-colors" />
                                </a>
                                <a href="#" className="min-w-[44px] min-h-[44px] p-2.5 bg-white/10 hover:bg-accent/20 rounded-lg transition-all hover:scale-110 flex items-center justify-center" aria-label="Instagram">
                                    <Instagram className="w-5 h-5 text-white hover:text-accent transition-colors" />
                                </a>
                                <a href="#" className="min-w-[44px] min-h-[44px] p-2.5 bg-white/10 hover:bg-accent/20 rounded-lg transition-all hover:scale-110 flex items-center justify-center" aria-label="Facebook">
                                    <Facebook className="w-5 h-5 text-white hover:text-accent transition-colors" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-gray-300">
                    <p>&copy; {new Date().getFullYear()} Crypto Suggest - Your Trusted Crypto Directory. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
