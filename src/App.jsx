import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Browse from './pages/Browse';
import WebsiteDetail from './pages/WebsiteDetail';
import Categories from './pages/Categories';
import About from './pages/About';
import Contact from './pages/Contact';
import SubmitWebsite from './pages/SubmitWebsite';
import Compare from './pages/Compare';
import { CompareProvider } from './contexts/CompareContext';
import { WalletProvider } from './contexts/WalletContext';
import { BookmarkProvider } from './contexts/BookmarkContext';
import CompareBar from './components/common/CompareBar';
import Bookmarks from './pages/Bookmarks';
import NotFound from './pages/NotFound';
import ScrollToTop from './components/common/ScrollToTop';

import Admin from './pages/Admin';
import Rankings from './pages/Rankings';
import Dashboard from './pages/Dashboard';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import Disclaimer from './pages/Disclaimer';

const ReferralHandler = () => {
    const location = useLocation();
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const ref = params.get('ref');
        if (ref) {
            localStorage.setItem('cs_referred_by', ref.trim());
        }
    }, [location]);
    return null;
};

function App() {
    return (
        <WalletProvider>
            <CompareProvider>
                <BookmarkProvider>
                    <Router>
                            <ScrollToTop />
                            <ReferralHandler />
                            <div className="min-h-screen bg-background-soft font-sans text-text-main">
                                <Routes>
                                    <Route path="/" element={<Home />} />
                                    <Route path="/browse" element={<Browse />} />
                                    <Route path="/category/:category" element={<Browse />} />
                                    <Route path="/website/:slug" element={<WebsiteDetail />} />
                                    <Route path="/categories" element={<Categories />} />
                                    <Route path="/about" element={<About />} />
                                    <Route path="/contact" element={<Contact />} />
                                    <Route path="/submit" element={<SubmitWebsite />} />
                                    <Route path="/compare" element={<Compare />} />
                                    <Route path="/bookmarks" element={<Bookmarks />} />
                                    <Route path="/admin" element={<Admin />} />
                                    <Route path="/rankings" element={<Rankings />} />
                                    <Route path="/dashboard" element={<Dashboard />} />
                                    <Route path="/privacy" element={<PrivacyPolicy />} />
                                    <Route path="/terms" element={<TermsConditions />} />
                                    <Route path="/disclaimer" element={<Disclaimer />} />
                                    <Route path="*" element={<NotFound />} />
                                </Routes>
                            <CompareBar />
                        </div>
                    </Router>
                </BookmarkProvider>
            </CompareProvider>
        </WalletProvider>
    );
}

export default App;
