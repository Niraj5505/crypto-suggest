import React from 'react';
import Header from './Header';
import Footer from './Footer';

const PageLayout = ({ children }) => {
    React.useEffect(() => {
        const hasVisited = sessionStorage.getItem('cs_has_visited');
        if (!hasVisited) {
            const API_URL = import.meta.env.VITE_API_URL || '/api';
            fetch(`${API_URL}/analytics/hit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            }).then(() => {
                sessionStorage.setItem('cs_has_visited', 'true');
            }).catch(err => console.error('Analytics error:', err));
        }
    }, []);

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default PageLayout;
