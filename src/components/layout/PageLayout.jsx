import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import WelcomePromoModal from '../common/WelcomePromoModal';

const PageLayout = ({ children }) => {
    const location = useLocation();

    React.useEffect(() => {
        const API_URL = import.meta.env.VITE_API_URL || '/api';
        fetch(`${API_URL}/analytics/hit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: location.pathname + location.search })
        }).catch(err => console.error('Analytics error:', err));
    }, [location.pathname, location.search]);

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <WelcomePromoModal />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default PageLayout;
