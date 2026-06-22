import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import Button from '../components/common/Button';

// This page is kept for backward-compatibility with old email links.
// Verification is now done via OTP entered directly in the app modal.
const VerifyEmail = () => {
    return (
        <PageLayout>
            <div className="min-h-[80vh] flex items-center justify-center pt-28 pb-12 bg-slate-50">
                <div className="container-custom flex justify-center">
                    <div className="bg-white p-10 rounded-[2.5rem] shadow-premium max-w-lg w-full border border-gray-150 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-primary-dark" />
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-10 -mt-10" />

                        <div className="py-6">
                            <div className="w-20 h-20 bg-blue-50 text-primary rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-100">
                                <ShieldCheck className="w-10 h-10" />
                            </div>
                            <h1 className="text-3xl font-bold text-text-main mb-3">Email Verification</h1>
                            <p className="text-text-muted mb-3 leading-relaxed">
                                We've upgraded to <strong className="text-text-main">OTP-based verification</strong>.
                            </p>
                            <p className="text-text-muted text-sm mb-8 leading-relaxed">
                                After registering, a <strong>6-digit code</strong> is sent directly to your inbox.
                                Enter it in the verification screen that appears automatically.
                            </p>
                            <Link to="/">
                                <Button variant="primary" className="w-full py-4 flex items-center justify-center gap-2 font-bold hover:shadow-lg">
                                    <span>Go to Home Page</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default VerifyEmail;
