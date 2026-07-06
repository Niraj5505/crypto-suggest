import React from 'react';
import PageLayout from '../components/layout/PageLayout';

const Disclaimer = () => {
    return (
        <PageLayout>
            <div className="container-custom pt-32 pb-24">
                <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-150">
                    <h1 className="text-4xl font-black text-gray-900 mb-6">Disclaimer</h1>
                    <p className="text-sm text-text-muted mb-8 font-semibold">Last Updated: July 2026</p>
                    
                    <div className="space-y-6 text-gray-700 leading-relaxed font-medium">
                        <section className="space-y-3">
                            <h2 className="text-2xl font-bold text-gray-950">1. Not Financial Advice</h2>
                            <p>
                                All content provided on Crypto Suggest is for educational and informational purposes only. None of the information contained on this platform constitutes investment, financial, or trading advice.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-2xl font-bold text-gray-950">2. No Guarantees of Safety</h2>
                            <p>
                                While we strive to verify each project diligently, our safety badges and trust scores do not guarantee the absolute safety of any platform. Smart contracts, teams, and market conditions can change rapidly.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-2xl font-bold text-gray-950">3. Third-Party Links</h2>
                            <p>
                                This website contains links to external websites that are not operated by us. We have no control over the content and practices of these third-party platforms and accept no liability for any potential losses.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-2xl font-bold text-gray-950">4. High Risk Nature of Crypto</h2>
                            <p>
                                Interacting with cryptocurrency, DeFi, NFTs, and network marketing (MLM) programs involves high financial risk. You should only invest capital that you are prepared to lose entirely.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default Disclaimer;
