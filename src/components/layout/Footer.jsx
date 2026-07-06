import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Mail, Linkedin, MessageSquare, Send, Shield, ShieldAlert, FileText, Info } from 'lucide-react';

const Footer = () => {
    const categories = [
        { name: 'Crypto Exchanges', path: '/category/crypto-exchanges' },
        { name: 'NFT Marketplaces', path: '/category/nft-marketplaces' },
        { name: 'Crypto Wallets', path: '/category/crypto-wallets' },
        { name: 'DeFi Platforms', path: '/category/defi-platforms' },
        { name: 'MLM', path: '/category/mlm' },
        { name: 'Blockchain Explorers', path: '/category/blockchain-explorers' }
    ];

    return (
        <footer className="bg-primary-dark text-white border-t border-white/5">
            <div className="container-custom py-12 sm:py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
                    {/* About */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-base sm:text-lg text-accent flex items-center gap-2">
                            <Shield className="w-5 h-5 text-accent" /> About Crypto Suggest
                        </h4>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Your trusted directory for discovering verified crypto websites. We manually verify listings, publish scam alerts, and protect investors.
                        </p>
                        <div className="pt-2">
                            <p className="text-xs text-gray-400 font-medium">Founder: Niraj Thanki</p>
                            <p className="text-xs text-gray-400 font-medium">Email: contact@cryptosuggest.live</p>
                        </div>
                    </div>

                    {/* Popular Categories */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-base sm:text-lg text-accent">Popular Categories</h4>
                        <ul className="space-y-2">
                            {categories.map(cat => (
                                <li key={cat.path}>
                                    <Link to={cat.path} className="text-white/70 hover:text-accent text-sm transition-colors inline-block py-0.5">
                                        {cat.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Trust & Legal Links */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-base sm:text-lg text-accent flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-accent" /> Legal & Trust
                        </h4>
                        <ul className="space-y-2.5">
                            <li>
                                <Link to="/privacy" className="text-white/70 hover:text-accent text-sm transition-colors flex items-center gap-2 py-0.5">
                                    <FileText className="w-4 h-4 opacity-70" /> Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link to="/terms" className="text-white/70 hover:text-accent text-sm transition-colors flex items-center gap-2 py-0.5">
                                    <FileText className="w-4 h-4 opacity-70" /> Terms & Conditions
                                </Link>
                            </li>
                            <li>
                                <Link to="/disclaimer" className="text-white/70 hover:text-accent text-sm transition-colors flex items-center gap-2 py-0.5">
                                    <Info className="w-4 h-4 opacity-70" /> Disclaimer
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="text-white/70 hover:text-accent text-sm transition-colors flex items-center gap-2 py-0.5">
                                    <Info className="w-4 h-4 opacity-70" /> About Founder
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="text-white/70 hover:text-accent text-sm transition-colors flex items-center gap-2 py-0.5">
                                    <Mail className="w-4 h-4 opacity-70" /> Contact Us
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Follow & Connect */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-base sm:text-lg text-accent">Connect with Us</h4>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Join our community to stay updated on crypto safety audits and reviews.
                        </p>
                        
                        <div className="flex flex-wrap gap-2.5 pt-2">
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="min-w-[40px] min-h-[40px] p-2 bg-white/10 hover:bg-accent/20 rounded-xl transition-all hover:scale-105 flex items-center justify-center" aria-label="LinkedIn">
                                <Linkedin className="w-5 h-5 text-white hover:text-accent transition-colors" />
                            </a>
                            <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="min-w-[40px] min-h-[40px] p-2 bg-white/10 hover:bg-accent/20 rounded-xl transition-all hover:scale-105 flex items-center justify-center" aria-label="X (Twitter)">
                                <Twitter className="w-5 h-5 text-white hover:text-accent transition-colors" />
                            </a>
                            <a href="https://t.me" target="_blank" rel="noopener noreferrer" className="min-w-[40px] min-h-[40px] p-2 bg-white/10 hover:bg-accent/20 rounded-xl transition-all hover:scale-105 flex items-center justify-center" aria-label="Telegram">
                                <Send className="w-5 h-5 text-white hover:text-accent transition-colors" />
                            </a>
                            <a href="https://discord.gg" target="_blank" rel="noopener noreferrer" className="min-w-[40px] min-h-[40px] p-2 bg-white/10 hover:bg-accent/20 rounded-xl transition-all hover:scale-105 flex items-center justify-center" aria-label="Discord">
                                <MessageSquare className="w-5 h-5 text-white hover:text-accent transition-colors" />
                            </a>
                            <a href="mailto:contact@cryptosuggest.live" className="min-w-[40px] min-h-[40px] p-2 bg-white/10 hover:bg-accent/20 rounded-xl transition-all hover:scale-105 flex items-center justify-center" aria-label="Email">
                                <Mail className="w-5 h-5 text-white hover:text-accent transition-colors" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 mt-10 sm:mt-12 pt-8 text-center text-xs sm:text-sm text-gray-400">
                    <p>&copy; {new Date().getFullYear()} Crypto Suggest - Your Trusted Crypto Directory. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
