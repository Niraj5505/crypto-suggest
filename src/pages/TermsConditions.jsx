import React from 'react';
import PageLayout from '../components/layout/PageLayout';

const TermsConditions = () => {
    return (
        <PageLayout>
            <div className="container-custom pt-32 pb-24">
                <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-150">
                    <h1 className="text-4xl font-black text-gray-900 mb-6">Terms & Conditions</h1>
                    <p className="text-sm text-text-muted mb-8 font-semibold">Last Updated: July 2026</p>
                    
                    <div className="space-y-6 text-gray-700 leading-relaxed font-medium">
                        <section className="space-y-3">
                            <h2 className="text-2xl font-bold text-gray-950">1. Acceptance of Terms</h2>
                            <p>
                                By accessing and using Crypto Suggest, you agree to comply with and be bound by these Terms & Conditions. If you do not agree to these terms, please refrain from using the platform.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-2xl font-bold text-gray-950">2. Platform Role & Disclaimer</h2>
                            <p>
                                Crypto Suggest is an informational directory and verification service. We do not provide financial advice. Users are responsible for doing their own due diligence before interacting with any platform listed here.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-2xl font-bold text-gray-950">3. Project Submissions</h2>
                            <p>
                                When submitting a project, you warrant that all information provided is accurate and non-misleading. We reserve the right to decline or remove any listing at our sole discretion.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-2xl font-bold text-gray-950">4. User Conduct</h2>
                            <p>
                                Users must not attempt to manipulate trust scores, post fake reviews, or exploit platform APIs. Doing so may result in account termination and wallet address blacklisting.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-2xl font-bold text-gray-950">5. Changes to Terms</h2>
                            <p>
                                We reserve the right to modify these terms at any time. Continued use of the platform constitutes your acceptance of the updated terms.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default TermsConditions;
