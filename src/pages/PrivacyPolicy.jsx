import React from 'react';
import PageLayout from '../components/layout/PageLayout';

const PrivacyPolicy = () => {
    return (
        <PageLayout>
            <div className="container-custom pt-32 pb-24">
                <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-150">
                    <h1 className="text-4xl font-black text-gray-900 mb-6">Privacy Policy</h1>
                    <p className="text-sm text-text-muted mb-8 font-semibold">Last Updated: July 2026</p>
                    
                    <div className="space-y-6 text-gray-700 leading-relaxed font-medium">
                        <section className="space-y-3">
                            <h2 className="text-2xl font-bold text-gray-950">1. Information We Collect</h2>
                            <p>
                                We collect information that you provide directly to us when registering an account, submitting a website for verification, or contacting us. This may include your username, email address, mobile number, and public wallet address.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-2xl font-bold text-gray-950">2. How We Use Your Information</h2>
                            <p>
                                We use the collected data to maintain our verification services, personalize your platform experience, prevent fraudulent submissions, and communicate updates about safety audits.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-2xl font-bold text-gray-950">3. Cookies & Analytics</h2>
                            <p>
                                Crypto Suggest uses cookies and local storage to track user preferences, session status, and anonymous analytics. You can control cookie preferences directly through your browser settings.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-2xl font-bold text-gray-950">4. Data Security</h2>
                            <p>
                                We implement industry-standard encryption and security measures to protect your account data. However, no transmission over the internet can be guaranteed to be 100% secure.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-2xl font-bold text-gray-950">5. Contact Us</h2>
                            <p>
                                If you have any questions about this Privacy Policy, please contact our support team at support@cryptosuggest.live.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default PrivacyPolicy;
