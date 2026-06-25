import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, ArrowRight, Layers } from 'lucide-react';
import { useCompare } from '../../contexts/CompareContext';
import Button from './Button';

const CompareBar = () => {
    const { selectedWebsites, removeFromCompare, clearCompare } = useCompare();

    if (selectedWebsites.length === 0) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-3xl px-4"
            >
                <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-primary/20 p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
                        <div className="flex items-center gap-2 text-sm font-bold text-primary whitespace-nowrap">
                            <Layers className="w-5 h-5" />
                            <span>Comparing ({selectedWebsites.length}/3)</span>
                        </div>

                        <div className="h-8 w-px bg-gray-200 mx-2 hidden md:block"></div>

                        <div className="flex gap-2">
                            {selectedWebsites.map(site => (
                                <div key={site.id} className="relative group flex-shrink-0">
                                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm pr-8">
                                        <img
                                            src={(() => {
                                                try {
                                                    const domain = new URL(site.url).hostname.replace('www.', '');
                                                    return domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : `https://ui-avatars.com/api/?name=${encodeURIComponent(site.name)}&size=32&background=random`;
                                                } catch (e) {
                                                    return `https://ui-avatars.com/api/?name=${encodeURIComponent(site.name)}&size=32&background=random`;
                                                }
                                            })()}
                                            alt={site.name}
                                            className="w-5 h-5 rounded flex-shrink-0 object-contain bg-white"
                                        />
                                        <span className="text-sm font-medium truncate max-w-[80px]">{site.name}</span>
                                    </div>
                                    <button
                                        onClick={() => removeFromCompare(site.id)}
                                        className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                        <button
                            onClick={clearCompare}
                            className="text-sm text-text-muted hover:text-red-500 transition-colors underline"
                        >
                            Clear
                        </button>
                        <Link to="/compare">
                            <Button className="shadow-lg shadow-primary/30 whitespace-nowrap">
                                Compare Now <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CompareBar;
