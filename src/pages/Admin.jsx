import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, MessageSquare, Check, X, AlertTriangle, ExternalLink, Trash2, Wallet, LayoutGrid } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import Button from '../components/common/Button';
import {
    getAdminWebsites,
    verifyWebsite,
    deleteWebsite,
    getAdminScamReports,
    updateScamReportStatus,
    getAdminReviews,
    deleteReview
} from '../services/api';

const Admin = () => {
    const { isConnected, walletAddress, connectWallet, getTruncatedAddress } = useWallet();
    const [activeTab, setActiveTab] = useState('projects'); // 'projects' | 'scams' | 'reviews'
    
    // Data states
    const [websites, setWebsites] = useState([]);
    const [scamReports, setScamReports] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch data based on active tab
    const fetchData = async () => {
        if (!isConnected) return;
        setLoading(true);
        try {
            if (activeTab === 'projects') {
                const data = await getAdminWebsites();
                setWebsites(data);
            } else if (activeTab === 'scams') {
                const data = await getAdminScamReports();
                setScamReports(data);
            } else if (activeTab === 'reviews') {
                const data = await getAdminReviews();
                setReviews(data);
            }
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [isConnected, activeTab]);

    // Handle Approvals
    const handleApproveWebsite = async (slug) => {
        if (window.confirm('Are you sure you want to approve this website? It will immediately show up on the public Browse catalog.')) {
            try {
                await verifyWebsite(slug);
                alert('✅ Website approved successfully!');
                fetchData();
            } catch (error) {
                alert(`❌ Error verifying website: ${error.message}`);
            }
        }
    };

    const handleRejectWebsite = async (slug) => {
        if (window.confirm('Are you sure you want to REJECT and DELETE this website submission? This action is irreversible.')) {
            try {
                await deleteWebsite(slug);
                alert('✅ Website deleted successfully!');
                fetchData();
            } catch (error) {
                alert(`❌ Error rejecting website: ${error.message}`);
            }
        }
    };

    // Handle Scam Status Updates
    const handleUpdateScamStatus = async (id, status) => {
        try {
            await updateScamReportStatus(id, status);
            alert(`✅ Scam report status updated to: ${status}`);
            fetchData();
        } catch (error) {
            alert(`❌ Error updating scam report: ${error.message}`);
        }
    };

    // Handle Review Moderation
    const handleDeleteReview = async (id) => {
        if (window.confirm('Are you sure you want to delete this review? This is used for moderation of spam/inappropriate content.')) {
            try {
                await deleteReview(id);
                alert('✅ Review deleted successfully!');
                fetchData();
            } catch (error) {
                alert(`❌ Error deleting review: ${error.message}`);
            }
        }
    };

    const getScamStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-50 text-yellow-700 border-yellow-250';
            case 'under_investigation':
                return 'bg-blue-50 text-blue-700 border-blue-250';
            case 'confirmed':
                return 'bg-red-50 text-red-700 border-red-250';
            case 'resolved':
                return 'bg-green-50 text-green-700 border-green-250';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    if (!isConnected) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-white p-10 rounded-[2rem] shadow-premium max-w-md w-full border border-gray-150">
                    <div className="w-20 h-20 bg-blue-50 text-primary rounded-full flex items-center justify-center mb-6 mx-auto">
                        <Wallet className="w-10 h-10" />
                    </div>
                    <h1 className="text-2xl font-bold text-text-main mb-3">Admin Authentication</h1>
                    <p className="text-text-muted mb-8 text-sm">
                        To view the moderation dashboard, please connect your authorized crypto wallet.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Button variant="primary" className="w-full py-3.5 flex items-center justify-center gap-2 font-bold" onClick={() => connectWallet()}>
                            <span>Connect Wallet</span>
                        </Button>
                        <Link to="/" className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors py-2 block">
                            &larr; Back to Public Directory
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-slate-100 font-sans text-text-main">
            {/* Sidebar Navigation */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between flex-shrink-0">
                <div>
                    {/* Header/Logo */}
                    <div className="p-6 border-b border-slate-800 flex items-center gap-2.5">
                        <ShieldCheck className="w-8 h-8 text-primary fill-primary/10" />
                        <div>
                            <span className="font-black text-lg block tracking-tight">CryptoSuggest</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Admin Panel</span>
                        </div>
                    </div>
                    
                    {/* Menu Items */}
                    <nav className="p-4 space-y-2">
                        <button
                            onClick={() => setActiveTab('projects')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-sm ${activeTab === 'projects' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <ShieldCheck className="w-5 h-5" />
                            <span>Approvals</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('scams')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-sm ${activeTab === 'scams' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <ShieldAlert className="w-5 h-5" />
                            <span>Scam Reports</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('reviews')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-sm ${activeTab === 'reviews' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <MessageSquare className="w-5 h-5" />
                            <span>Reviews</span>
                        </button>
                    </nav>
                </div>

                {/* Back to Public Link */}
                <div className="p-4 border-t border-slate-800">
                    <Link to="/" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-800 hover:text-white transition-all text-sm">
                        <LayoutGrid className="w-5 h-5" />
                        <span>Public Directory</span>
                    </Link>
                </div>
            </aside>

            {/* Main content pane */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Dashboard topbar */}
                <header className="h-20 bg-white border-b border-slate-200/80 flex items-center justify-between px-8 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold capitalize text-slate-850">
                            {activeTab === 'projects' ? 'Project Approvals' : activeTab === 'scams' ? 'Scam Investigations' : 'Review Moderation'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 py-1.5 px-4 rounded-xl">
                            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                            <span className="font-mono text-xs font-bold text-text-main">{getTruncatedAddress()}</span>
                        </div>
                    </div>
                </header>

                {/* Dynamic Content Panel */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
                    {loading ? (
                        <div className="bg-white rounded-2xl p-20 border border-slate-200/80 text-center shadow-sm">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-text-muted font-medium">Loading panel items...</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                            {/* Projects Approvals Tab */}
                            {activeTab === 'projects' && (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-bold text-xs uppercase tracking-wider">
                                                <th className="py-5 px-6">Submitted Platform</th>
                                                <th className="py-5 px-6">Category</th>
                                                <th className="py-5 px-6">Website Link</th>
                                                <th className="py-5 px-6">Verification Status</th>
                                                <th className="py-5 px-6 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {websites.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" className="text-center py-20 text-slate-450 font-medium">
                                                        No submissions pending approval.
                                                    </td>
                                                </tr>
                                            ) : (
                                                websites.map((site) => (
                                                    <tr key={site.id} className="hover:bg-slate-50/50 transition-colors duration-200">
                                                        <td className="py-6 px-6">
                                                            <div>
                                                                <h4 className="font-bold text-text-main text-base">{site.name}</h4>
                                                                <span className="text-xs text-text-muted block max-w-sm line-clamp-1">{site.longDescription || site.shortDescription}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-6 px-6">
                                                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold">
                                                                {site.category}
                                                            </span>
                                                        </td>
                                                        <td className="py-6 px-6">
                                                            <a href={site.url} target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline inline-flex items-center gap-1 text-sm">
                                                                <span>Visit Site</span>
                                                                <ExternalLink className="w-3.5 h-3.5" />
                                                            </a>
                                                        </td>
                                                        <td className="py-6 px-6">
                                                            {site.verified ? (
                                                                <span className="px-2.5 py-1 bg-green-50 border border-green-200 text-green-700 text-xs font-bold rounded-full select-none">
                                                                    ✓ Verified
                                                                </span>
                                                            ) : (
                                                                <span className="px-2.5 py-1 bg-yellow-50 border border-yellow-250 text-yellow-700 text-xs font-bold rounded-full select-none animate-pulse">
                                                                    ⏳ Pending Approve
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="py-6 px-6 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                {!site.verified && (
                                                                    <button
                                                                        onClick={() => handleApproveWebsite(site.slug)}
                                                                        className="h-10 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
                                                                    >
                                                                        <Check className="w-4 h-4" />
                                                                        <span>Approve</span>
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => handleRejectWebsite(site.slug)}
                                                                    className="h-10 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold border border-red-200/50 transition-all flex items-center gap-1.5"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                    <span>{site.verified ? 'Delete' : 'Reject'}</span>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Scam Reports Tab */}
                            {activeTab === 'scams' && (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-bold text-xs uppercase tracking-wider">
                                                <th className="py-5 px-6">Reported Platform</th>
                                                <th className="py-5 px-6">Scam Type</th>
                                                <th className="py-5 px-6">Evidence / Hash</th>
                                                <th className="py-5 px-6">Complaint Detail</th>
                                                <th className="py-5 px-6 text-center">Status</th>
                                                <th className="py-5 px-6 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {scamReports.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" className="text-center py-20 text-slate-450 font-medium">
                                                        No scam reports registered in system database.
                                                    </td>
                                                </tr>
                                            ) : (
                                                scamReports.map((report) => (
                                                    <tr key={report._id} className="hover:bg-slate-50/50 transition-colors duration-200">
                                                        <td className="py-6 px-6 font-bold text-text-main text-base">
                                                            {report.websiteId}
                                                        </td>
                                                        <td className="py-6 px-6">
                                                            <span className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-100 rounded-lg text-xs font-bold uppercase select-none">
                                                                {report.scamType.replace(/_/g, ' ')}
                                                            </span>
                                                        </td>
                                                        <td className="py-6 px-6">
                                                            <div className="flex flex-col gap-1">
                                                                {report.txHash && (
                                                                    <a href={`https://etherscan.io/tx/${report.txHash}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-mono hover:underline flex items-center gap-1">
                                                                        <span>Tx: {report.txHash.slice(0, 6)}...{report.txHash.slice(-4)}</span>
                                                                        <ExternalLink className="w-3 h-3" />
                                                                    </a>
                                                                )}
                                                                {report.evidenceUrl ? (
                                                                    <a href={report.evidenceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1">
                                                                        <span>Screenshot Proof</span>
                                                                        <ExternalLink className="w-3 h-3" />
                                                                    </a>
                                                                ) : (
                                                                    <span className="text-xs text-slate-450">No media evidence</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="py-6 px-6">
                                                            <span className="text-xs text-text-muted block max-w-xs md:max-w-md break-words whitespace-pre-wrap">{report.description}</span>
                                                            <span className="text-[10px] text-slate-450 block font-mono mt-1">By: {report.walletAddress}</span>
                                                        </td>
                                                        <td className="py-6 px-6 text-center">
                                                            <span className={`px-2.5 py-1 text-xs border font-bold rounded-full select-none ${getScamStatusBadge(report.status)}`}>
                                                                {report.status.replace(/_/g, ' ').toUpperCase()}
                                                            </span>
                                                        </td>
                                                        <td className="py-6 px-6 text-right">
                                                            <div className="flex items-center justify-end gap-1.5">
                                                                {report.status !== 'confirmed' && (
                                                                    <button
                                                                        onClick={() => handleUpdateScamStatus(report._id, 'confirmed')}
                                                                        className="h-9 px-3 bg-red-650 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                                                                        title="Confirm scam exploitation"
                                                                    >
                                                                        <AlertTriangle className="w-3.5 h-3.5" />
                                                                        <span>Confirm Scam</span>
                                                                    </button>
                                                                )}
                                                                {report.status !== 'under_investigation' && report.status !== 'confirmed' && (
                                                                    <button
                                                                        onClick={() => handleUpdateScamStatus(report._id, 'under_investigation')}
                                                                        className="h-9 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors"
                                                                    >
                                                                        Investigate
                                                                    </button>
                                                                )}
                                                                {report.status !== 'resolved' && (
                                                                    <button
                                                                        onClick={() => handleUpdateScamStatus(report._id, 'resolved')}
                                                                        className="h-9 px-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                                                                    >
                                                                        <Check className="w-3.5 h-3.5" />
                                                                        <span>Resolve</span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Reviews Tab */}
                            {activeTab === 'reviews' && (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-bold text-xs uppercase tracking-wider">
                                                <th className="py-5 px-6">Website / Platform</th>
                                                <th className="py-5 px-6">Rating</th>
                                                <th className="py-5 px-6">Review Content</th>
                                                <th className="py-5 px-6 text-center">Media Proof</th>
                                                <th className="py-5 px-6 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {reviews.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" className="text-center py-20 text-slate-450 font-medium">
                                                        No user reviews submitted yet.
                                                    </td>
                                                </tr>
                                            ) : (
                                                reviews.map((rev) => (
                                                    <tr key={rev._id} className="hover:bg-slate-50/50 transition-colors duration-200">
                                                        <td className="py-6 px-6 font-bold text-text-main text-base">
                                                            {rev.websiteId}
                                                        </td>
                                                        <td className="py-6 px-6">
                                                            <div className="font-semibold text-text-main text-sm">
                                                                ⭐ {rev.rating} <span className="text-slate-400 font-normal">/ 100</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-6 px-6">
                                                            <div>
                                                                {rev.title && <h5 className="font-bold text-text-main text-sm mb-1">{rev.title}</h5>}
                                                                <p className="text-xs text-text-muted max-w-md break-words whitespace-pre-wrap">{rev.text}</p>
                                                                <span className="text-[10px] text-slate-450 block font-mono mt-1">Author: {rev.walletAddress}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-6 px-6 text-center">
                                                            {rev.screenshotUrl ? (
                                                                <a href={rev.screenshotUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1">
                                                                    <span>View Image</span>
                                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                                </a>
                                                            ) : (
                                                                <span className="text-xs text-slate-450">None</span>
                                                            )}
                                                        </td>
                                                        <td className="py-6 px-6 text-right">
                                                            <button
                                                                onClick={() => handleDeleteReview(rev._id)}
                                                                className="h-10 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold border border-red-200/50 transition-all flex items-center gap-1.5 ml-auto"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                                <span>Delete</span>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Admin;
