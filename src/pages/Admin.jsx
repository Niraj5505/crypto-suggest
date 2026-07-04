import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    ShieldCheck, ShieldAlert, MessageSquare, Check, X, AlertTriangle,
    ExternalLink, Trash2, Wallet, LayoutGrid, Users, Folder,
    CreditCard, BarChart2, RefreshCw, Eye, Star, Flag, Activity,
    Search, ChevronDown, TrendingUp, Crown, Zap, Gem,
    CheckCircle2, Clock, Globe, Hash, Calendar, Filter,
    Plus, PenLine, Lock, Mail, EyeOff, LogOut
} from 'lucide-react';
import Button from '../components/common/Button';
import {
    getAdminWebsites, verifyWebsite, deleteWebsite,
    getAdminScamReports, updateScamReportStatus,
    getAdminReviews, deleteReview, getAdminUsers, getAdminProjects,
    updateUserBlockStatus, updateUserVerifyStatus,
    createAdminProject, updateAdminProject, deleteAdminProject,
    loginAdmin, impersonateUser
} from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const getAdminHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

const getAdminSubPayments = async (status) => {
    const url = status ? `${API_URL}/admin/subscription-payments?status=${status}` : `${API_URL}/admin/subscription-payments`;
    const res = await fetch(url, {
        headers: getAdminHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch subscription payments');
    return res.json();
};

const reviewSubPayment = async (id, action, adminNote = '') => {
    const res = await fetch(`${API_URL}/admin/subscription-payments/${id}`, {
        method: 'PUT',
        headers: getAdminHeaders(),
        body: JSON.stringify({ action, adminNote })
    });
    if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Action failed'); }
    return res.json();
};
import logoSrc from '../assets/logo.png';

/* ─────────────────── helpers ─────────────────── */
const SUB_PLANS = { starter: { label: 'Starter', price: 99, gradient: 'from-blue-500 to-cyan-500' },
                    pro:     { label: 'Pro',     price: 199, gradient: 'from-violet-600 to-purple-600' },
                    premium: { label: 'Premium', price: 299, gradient: 'from-amber-500 to-orange-500' },
                    enterprise: { label: 'Enterprise', price: 999, gradient: 'from-amber-500 to-orange-500' } };

const SCAM_STATUS = {
    pending:             { label: 'Pending',       color: 'text-yellow-700', bg: 'bg-yellow-50',  border: 'border-yellow-200' },
    under_investigation: { label: 'Under Review',  color: 'text-blue-700',   bg: 'bg-blue-50',    border: 'border-blue-200'   },
    confirmed:           { label: 'Confirmed',     color: 'text-red-700',    bg: 'bg-red-50',     border: 'border-red-200'    },
    resolved:            { label: 'Resolved',      color: 'text-green-700',  bg: 'bg-green-50',   border: 'border-green-200'  },
};

const PROJECT_STATUSES = [
    { id: 'active',      label: 'Active',       color: 'text-green-700',  bg: 'bg-green-100',  border: 'border-green-200',  dot: 'bg-green-500' },
    { id: 'development', label: 'In Dev',        color: 'text-blue-700',   bg: 'bg-blue-100',   border: 'border-blue-200',   dot: 'bg-blue-500' },
    { id: 'paused',      label: 'Paused',        color: 'text-yellow-700', bg: 'bg-yellow-100', border: 'border-yellow-200', dot: 'bg-yellow-500' },
    { id: 'completed',   label: 'Completed',     color: 'text-purple-700', bg: 'bg-purple-100', border: 'border-purple-200', dot: 'bg-purple-500' },
    { id: 'archived',    label: 'Archived',      color: 'text-gray-600',   bg: 'bg-gray-100',   border: 'border-gray-200',   dot: 'bg-gray-400' },
];

const PROJECT_CATEGORIES = [
    'DeFi Protocol', 'NFT Project', 'Crypto Exchange', 'Wallet', 'DAO',
    'Layer 2', 'Infrastructure', 'Analytics', 'GameFi', 'Other',
];

const GRADIENTS = [
    'from-blue-500 to-indigo-600',
    'from-purple-500 to-pink-600',
    'from-green-500 to-emerald-600',
    'from-orange-500 to-red-500',
    'from-cyan-500 to-blue-600',
    'from-rose-500 to-pink-500',
    'from-violet-500 to-purple-600',
    'from-teal-500 to-cyan-600',
];

const BLANK_PROJECT = {
    walletAddress: '',
    name: '',
    description: '',
    url: '',
    githubUrl: '',
    category: '',
    status: 'development',
    tags: '',
    gradient: 'from-blue-500 to-indigo-600',
};

const formatDate = (ts) => ts
    ? new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';

const truncateAddr = (addr) => addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : '—';

/* Stat card */
const StatCard = ({ icon: Icon, label, value, sub, color, bg }) => (
    <div className={`${bg} rounded-2xl p-5 border border-slate-200/60 flex items-center gap-4 shadow-sm`}>
        <div className={`w-12 h-12 rounded-xl ${color.replace('text-', 'bg-').replace('600','100').replace('700','100')} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <div>
            <p className="text-2xl font-black text-slate-800">{value}</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
            {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
        </div>
    </div>
);

/* Section header */
const SectionHead = ({ title, count, onRefresh, loading, children }) => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
            <h2 className="text-lg font-black text-slate-800">{title}</h2>
            {count !== undefined && (
                <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{count} total</span>
            )}
        </div>
        <div className="flex items-center gap-2">
            {children}
            {onRefresh && (
                <button onClick={onRefresh} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors" title="Refresh">
                    <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                </button>
            )}
        </div>
    </div>
);

/* Empty state */
const Empty = ({ icon: Icon, text }) => (
    <div className="text-center py-20">
        <Icon className="w-12 h-12 text-slate-200 mx-auto mb-3" />
        <p className="text-slate-400 font-semibold text-sm">{text}</p>
    </div>
);

/* ─────────────────── DB-backed admin data state ─────────────────── */

/* ─────────────────── ADMIN COMPONENT ─────────────────── */
const Admin = () => {
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(!!localStorage.getItem('adminToken'));
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    /* server data */
    const [websites,    setWebsites]    = useState([]);
    const [scamReports, setScamReports] = useState([]);
    const [reviews,     setReviews]     = useState([]);
    const [dbUsers,     setDbUsers]     = useState([]);
    const [dbProjects,  setDbProjects]  = useState([]);
    const [subPayments, setSubPayments] = useState([]);
    const [loading,     setLoading]     = useState(false);
    const [visiblePasswords, setVisiblePasswords] = useState({});
    const [uniqueVisitors, setUniqueVisitors] = useState(0);
    const [totalHits, setTotalHits] = useState(0);
    const [visitors, setVisitors] = useState([]);

    /* derived database subscriptions */
    const dbSubs = useMemo(() => {
        return dbUsers
            .filter(u => u.subscribedPlan)
            .map(u => ({
                wallet: u.walletAddress,
                planId: u.subscribedPlan,
                subscribedAt: u.subscribedAt,
                price: SUB_PLANS[u.subscribedPlan]?.price || 0
            }));
    }, [dbUsers]);

    /* search / filter */
    const [searchQ,    setSearchQ]    = useState('');
    const [subFilter,  setSubFilter]  = useState('all');
    const [scamFilter, setScamFilter] = useState('all');

    /* project management state */
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [editingProject, setEditingProject]   = useState(null); // null = add, obj = edit
    const [projectForm, setProjectForm]         = useState(BLANK_PROJECT);
    const [projectErrors, setProjectErrors]     = useState({});
    const [deleteConfirm, setDeleteConfirm]     = useState(null); // id to confirm
    const [projectSaved, setProjectSaved]       = useState(false);

    /* notifications */
    const [toast, setToast] = useState(null);
    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoginError('');
        setLoginLoading(true);
        try {
            const data = await loginAdmin(email, password);
            localStorage.setItem('adminToken', data.token);
            setIsAdminLoggedIn(true);
            showToast('Welcome back, Admin!');
        } catch (err) {
            setLoginError(err.message || 'Invalid credentials');
            showToast(err.message || 'Invalid credentials', 'error');
        } finally {
            setLoginLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        setIsAdminLoggedIn(false);
        setEmail('');
        setPassword('');
        showToast('Logged out successfully');
    };

    /* ── fetch server data ── */
    const fetchServerData = async () => {
        if (!isAdminLoggedIn) return;
        setLoading(true);
        try {
            const [w, s, r, u, p, sp] = await Promise.all([
                getAdminWebsites(),
                getAdminScamReports(),
                getAdminReviews(),
                getAdminUsers(),
                getAdminProjects(),
                getAdminSubPayments()
            ]);
            setWebsites(w || []);
            setScamReports(s || []);
            setReviews(r || []);
            setDbUsers(u || []);
            setDbProjects(p || []);
            setSubPayments(sp || []);

            // Fetch visitor analytics stats
            try {
                const resStats = await fetch(`${API_URL}/admin/visitors-stats`, {
                    headers: getAdminHeaders()
                });
                if (resStats.ok) {
                    const stats = await resStats.json();
                    setUniqueVisitors(stats.uniqueCount || 0);
                    setTotalHits(stats.totalCount || 0);
                }
            } catch (err) {
                console.error("Failed to load visitor stats:", err);
            }

            // Fetch visitor logs
            try {
                const resVisitors = await fetch(`${API_URL}/admin/visitors`, {
                    headers: getAdminHeaders()
                });
                if (resVisitors.ok) {
                    const data = await resVisitors.json();
                    setVisitors(data || []);
                }
            } catch (err) {
                console.error("Failed to load visitor logs:", err);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchServerData(); }, [isAdminLoggedIn]);

    /* actions */
    const handleApprove = async (slug) => {
        try { await verifyWebsite(slug); showToast('Website approved!'); fetchServerData(); }
        catch (e) { showToast(e.message, 'error'); }
    };
    const handleReject = async (slug) => {
        if (!window.confirm('Delete this website? This is irreversible.')) return;
        try { await deleteWebsite(slug); showToast('Website deleted!'); fetchServerData(); }
        catch (e) { showToast(e.message, 'error'); }
    };
    const handleScamStatus = async (id, status) => {
        try { await updateScamReportStatus(id, status); showToast(`Status → ${status}`); fetchServerData(); }
        catch (e) { showToast(e.message, 'error'); }
    };
    const handleDeleteReview = async (id) => {
        if (!window.confirm('Delete this review?')) return;
        try { await deleteReview(id); showToast('Review deleted!'); fetchServerData(); }
        catch (e) { showToast(e.message, 'error'); }
    };
    const handleToggleBlock = async (wallet, isBlocked) => {
        try { await updateUserBlockStatus(wallet, isBlocked); showToast(isBlocked ? 'User blocked!' : 'User unblocked!'); fetchServerData(); }
        catch (e) { showToast(e.message, 'error'); }
    };
    const handleToggleVerify = async (wallet, isVerified) => {
        try { await updateUserVerifyStatus(wallet, isVerified); showToast(isVerified ? 'User verified!' : 'User unverified!'); fetchServerData(); }
        catch (e) { showToast(e.message, 'error'); }
    };

    const togglePasswordVisibility = (userId) => {
        setVisiblePasswords(prev => ({
            ...prev,
            [userId]: !prev[userId]
        }));
    };

    const handleImpersonateUser = async (user) => {
        if (!window.confirm(`Are you sure you want to log in as user: ${user.email || user.username || user.walletAddress}?`)) return;
        try {
            const data = await impersonateUser(user._id || user.id);
            if (data.success) {
                // Store user credentials to simulate their login session
                localStorage.setItem('authToken', data.token);
                
                const connection = {
                    isConnected: true,
                    address: data.user.walletAddress,
                    username: data.user.username,
                    email: data.user.email,
                    connectedAt: Date.now()
                };
                localStorage.setItem('walletConnection', JSON.stringify(connection));
                
                showToast(`Logged in successfully as ${user.email || user.username}! Redirecting...`);
                
                // Redirect to user dashboard
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1500);
            }
        } catch (err) {
            showToast(err.message || 'Failed to login as user', 'error');
        }
    };

    const openAddProject = () => {
        setEditingProject(null);
        setProjectForm(BLANK_PROJECT);
        setProjectErrors({});
        setShowProjectModal(true);
    };

    const openEditProject = (proj) => {
        setEditingProject(proj);
        setProjectForm({
            walletAddress: proj.walletAddress || '',
            name: proj.name || '',
            description: proj.description || '',
            url: proj.url || '',
            githubUrl: proj.githubUrl || '',
            category: proj.category || '',
            status: proj.status || 'development',
            tags: Array.isArray(proj.tags) ? proj.tags.join(', ') : proj.tags || '',
            gradient: proj.gradient || 'from-blue-500 to-indigo-600'
        });
        setProjectErrors({});
        setShowProjectModal(true);
    };

    const closeProjectModal = () => {
        setShowProjectModal(false);
        setEditingProject(null);
        setProjectErrors({});
    };

    const validateProject = () => {
        const e = {};
        if (!projectForm.walletAddress.trim()) e.walletAddress = 'Wallet address is required';
        if (!projectForm.name.trim())          e.name          = 'Project name is required';
        if (!projectForm.description.trim() || projectForm.description.trim().length < 20)
            e.description = 'Description must be at least 20 characters';
        if (!projectForm.category)             e.category      = 'Select a category';
        if (!projectForm.status)               e.status        = 'Select a status';
        setProjectErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleProjectSave = async () => {
        if (!validateProject()) return;
        const tagsArr = projectForm.tags
            ? projectForm.tags.split(',').map(t => t.trim()).filter(Boolean)
            : [];
        try {
            if (editingProject) {
                await updateAdminProject(editingProject.id || editingProject._id, {
                    ...projectForm,
                    tags: tagsArr
                });
                showToast('Project updated successfully!');
            } else {
                await createAdminProject({
                    ...projectForm,
                    tags: tagsArr
                });
                showToast('Project created successfully!');
            }
            closeProjectModal();
            fetchServerData();
        } catch (err) {
            showToast(err.message || 'Failed to save project', 'error');
        }
    };

    const handleDeleteProject = async (id) => {
        if (!window.confirm('Delete this project? This is irreversible.')) return;
        try {
            await deleteAdminProject(id);
            showToast('Project deleted successfully!');
            fetchServerData();
        } catch (err) {
            showToast(err.message || 'Failed to delete project', 'error');
        }
    };

    const setProjectField = (k, v) => setProjectForm(f => ({ ...f, [k]: v }));

    /* derived counts */
    const pendingWebsites = websites.filter(w => !w.verified).length;
    const pendingScams    = scamReports.filter(s => s.status === 'pending').length;
    const pendingPaymentCount = subPayments.filter(p => p.status === 'pending').length;

    /* nav items */
    const NAV = [
        { id: 'overview',      label: 'Overview',          icon: BarChart2,    badge: null },
        { id: 'users',         label: 'Users',             icon: Users,        badge: dbUsers.length || null },
        { id: 'projects',      label: 'Projects',          icon: Folder,       badge: dbProjects.length || null },
        { id: 'reviews',       label: 'Reviews',           icon: MessageSquare, badge: reviews.length || null },
        { id: 'scams',         label: 'Scam Reports',      icon: ShieldAlert,  badge: pendingScams || null },
        { id: 'subscriptions', label: 'Subscriptions',     icon: CreditCard,   badge: dbSubs.length || null },
        { id: 'payments',      label: 'Payment Requests',  icon: CheckCircle2, badge: pendingPaymentCount || null },
        { id: 'approvals',     label: 'Site Approvals',    icon: ShieldCheck,  badge: pendingWebsites || null },
        { id: 'visitors',      label: 'Site Visitors',     icon: Eye,          badge: uniqueVisitors || null },
    ];

    /* ── not connected ── */
    if (!isAdminLoggedIn) return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden font-sans">
            {/* Background ambient light shapes */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="backdrop-blur-xl bg-slate-900/40 border border-slate-800/80 p-8 sm:p-10 rounded-[2rem] shadow-2xl max-w-md w-full relative z-10 transition-all animate-in fade-in zoom-in-95 duration-300">
                {/* Logo and title */}
                <div className="mb-8 animate-in slide-in-from-bottom duration-500 delay-100 fill-mode-both">
                    <div className="w-16 h-16 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Admin Portal</h1>
                    <p className="text-slate-400 mt-1.5 text-xs font-semibold uppercase tracking-wider">Access Panel Auth</p>
                </div>

                {/* Form */}
                <form onSubmit={handleLoginSubmit} className="space-y-5 text-left animate-in slide-in-from-bottom duration-500 delay-200 fill-mode-both">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email ID</label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="Enter admin email"
                                className="w-full bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all font-semibold"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Enter admin password"
                                className="w-full bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 rounded-xl py-3 pl-11 pr-11 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all font-semibold"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {loginError && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-shake">
                            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                            <span>{loginError}</span>
                        </div>
                    )}

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full py-3.5 flex items-center justify-center gap-2 font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-none text-white shadow-[0_4px_20px_rgba(37,99,235,0.25)] hover:shadow-[0_4px_25px_rgba(37,99,235,0.35)] transition-all rounded-xl mt-6"
                        disabled={loginLoading}
                    >
                        {loginLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <span>Access Panel</span>
                        )}
                    </Button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-800/60 animate-in slide-in-from-bottom duration-500 delay-300 fill-mode-both">
                    <Link to="/" className="text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors inline-flex items-center gap-1">
                        ← Back to Directory
                    </Link>
                </div>
            </div>
        </div>
    );

    /* ── main layout ── */
    return (
        <div className="min-h-screen flex bg-slate-100 font-sans">

            {/* ── Toast ── */}
            {toast && (
                <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-semibold animate-fade-in ${
                    toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
                }`}>
                    {toast.type === 'error' ? <X className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    {toast.msg}
                </div>
            )}

            {/* ── Sidebar ── */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between flex-shrink-0 min-h-screen">
                <div>
                    {/* Logo */}
                    <div className="p-6 border-b border-slate-800 flex items-center gap-2.5">
                        {/* Brand Logo */}
                        <img src={logoSrc} alt="Crypto Suggest Logo" className="h-8 w-8 flex-shrink-0 object-contain" />
                        <div>
                            <span className="font-black text-base block tracking-tight leading-none">CryptoSuggest</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 block">Admin Panel</span>
                        </div>
                    </div>

                    {/* Email pill */}
                    <div className="px-4 py-3 border-b border-slate-800">
                        <div className="flex items-center gap-2 bg-slate-800 rounded-xl px-3 py-2.5">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                            <span className="font-mono text-xs text-slate-300 truncate">admin@gmail.com</span>
                        </div>
                    </div>

                    {/* Nav */}
                    <nav className="p-3 space-y-1">
                        {NAV.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                                    activeTab === item.id
                                        ? 'bg-blue-600 text-white shadow-lg'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className="w-4 h-4 flex-shrink-0" />
                                    <span>{item.label}</span>
                                </div>
                                {item.badge > 0 && (
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                        activeTab === item.id ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'
                                    }`}>{item.badge}</span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-3 border-t border-slate-800 space-y-1">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-red-400 hover:bg-slate-800 hover:text-red-300 transition-all text-sm text-left"
                    >
                        <LogOut className="w-4 h-4 flex-shrink-0" />
                        <span>Log Out</span>
                    </button>
                    <Link to="/" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-slate-400 hover:bg-slate-800 hover:text-white transition-all text-sm">
                        <LayoutGrid className="w-4 h-4" />
                        <span>Public Directory</span>
                    </Link>
                </div>
            </aside>

            {/* ── Main ── */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Topbar */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
                    <h1 className="text-lg font-black text-slate-800">
                        {NAV.find(n => n.id === activeTab)?.label}
                    </h1>
                    <div className="flex items-center gap-3">
                        <button onClick={() => { fetchServerData(); }}
                            className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-colors" title="Refresh all">
                            <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 py-1.5 px-3 rounded-xl">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="font-mono text-xs font-bold text-slate-700">admin@gmail.com</span>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50">

                    {/* ══════════ OVERVIEW ══════════ */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                                <StatCard icon={Users}        label="Total Users"     value={dbUsers.length}    color="text-blue-600"   bg="bg-white" />
                                <StatCard icon={Folder}       label="User Projects"   value={dbProjects.length} color="text-indigo-600" bg="bg-white" />
                                <StatCard icon={MessageSquare} label="Reviews"        value={reviews.length}    color="text-purple-600" bg="bg-white" />
                                <StatCard icon={ShieldAlert}  label="Scam Reports"   value={scamReports.length} color="text-red-600"   bg="bg-white" />
                                <StatCard icon={CreditCard}   label="Subscriptions"  value={dbSubs.length}     color="text-green-600"  bg="bg-white" />
                                <StatCard icon={ShieldCheck}  label="Pending Sites"  value={pendingWebsites}   color="text-yellow-600" bg="bg-white" sub="Awaiting approval" />
                                <StatCard icon={Flag}         label="Pending Scams"  value={pendingScams}      color="text-orange-600" bg="bg-white" sub="Need investigation" />
                                <StatCard icon={Globe}        label="Total Sites"    value={websites.length}   color="text-teal-600"   bg="bg-white" />
                                <StatCard icon={Eye}          label="Unique Visitors" value={uniqueVisitors}    color="text-indigo-700" bg="bg-white" />
                                <StatCard icon={Activity}     label="Total Page Views" value={totalHits}         color="text-pink-600"   bg="bg-white" />
                            </div>

                            {/* Quick activity */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Recent scam reports */}
                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                                        <h3 className="font-bold text-slate-800 flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-red-500" /> Recent Scam Reports</h3>
                                        <button onClick={() => setActiveTab('scams')} className="text-xs text-blue-600 font-bold hover:underline">View All →</button>
                                    </div>
                                    {scamReports.length === 0 ? <div className="py-10 text-center text-slate-400 text-sm">No reports</div> : (
                                        <div className="divide-y divide-slate-50">
                                            {scamReports.slice(0, 4).map(r => {
                                                const meta = SCAM_STATUS[r.status] || SCAM_STATUS.pending;
                                                return (
                                                    <div key={r._id} className="flex items-center justify-between px-6 py-3">
                                                        <div>
                                                            <p className="font-semibold text-sm text-slate-800">{r.websiteId}</p>
                                                            <p className="text-[10px] text-slate-400">{r.scamType}</p>
                                                        </div>
                                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${meta.bg} ${meta.color} ${meta.border}`}>{meta.label}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Subscription overview */}
                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                                        <h3 className="font-bold text-slate-800 flex items-center gap-2"><CreditCard className="w-4 h-4 text-indigo-500" /> Subscriptions</h3>
                                        <button onClick={() => setActiveTab('subscriptions')} className="text-xs text-blue-600 font-bold hover:underline">View All →</button>
                                    </div>
                                    <div className="p-6 grid grid-cols-3 gap-3">
                                        {['starter','pro','premium'].map(pid => {
                                            const plan = SUB_PLANS[pid];
                                            const cnt  = dbSubs.filter(s => s.planId === pid).length;
                                            return (
                                                <div key={pid} className={`rounded-xl bg-gradient-to-br ${plan.gradient} p-4 text-white text-center`}>
                                                    <p className="text-2xl font-black">{cnt}</p>
                                                    <p className="text-xs text-white/80 font-semibold">{plan.label}</p>
                                                    <p className="text-[10px] text-white/60">${plan.price}/mo</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Recent reviews */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-purple-500" /> Recent Reviews</h3>
                                    <button onClick={() => setActiveTab('reviews')} className="text-xs text-blue-600 font-bold hover:underline">View All →</button>
                                </div>
                                {reviews.length === 0 ? <div className="py-10 text-center text-slate-400 text-sm">No reviews</div> : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead><tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                <th className="py-3 px-6 text-left">Platform</th>
                                                <th className="py-3 px-6 text-left">Rating</th>
                                                <th className="py-3 px-6 text-left">Author</th>
                                            </tr></thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {reviews.slice(0, 4).map(r => (
                                                    <tr key={r._id} className="hover:bg-slate-50">
                                                        <td className="py-3 px-6 font-semibold text-slate-800">{r.websiteId}</td>
                                                        <td className="py-3 px-6">⭐ {r.rating}<span className="text-slate-400 text-xs">/100</span></td>
                                                        <td className="py-3 px-6 font-mono text-xs text-slate-400">{truncateAddr(r.walletAddress)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ══════════ USERS ══════════ */}
                    {activeTab === 'users' && (
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <SectionHead title="Registered Users" count={dbUsers.length} onRefresh={fetchServerData} loading={loading}>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        value={searchQ}
                                        onChange={e => setSearchQ(e.target.value)}
                                        placeholder="Search wallet…"
                                        className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 w-52"
                                    />
                                </div>
                            </SectionHead>
                            {dbUsers.length === 0 ? <Empty icon={Users} text="No users found in database" /> : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead><tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            <th className="py-4 px-6 text-left">#</th>
                                            <th className="py-4 px-6 text-left">Wallet / Email Address</th>
                                            <th className="py-4 px-6 text-left">Password Hash</th>
                                            <th className="py-4 px-6 text-left">Plan</th>
                                            <th className="py-4 px-6 text-left">Status</th>
                                            <th className="py-4 px-6 text-left">Projects</th>
                                            <th className="py-4 px-6 text-left">Subscribed</th>
                                            <th className="py-4 px-6 text-right">Actions</th>
                                        </tr></thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {dbUsers
                                                .filter(u => {
                                                    const q = searchQ.toLowerCase();
                                                    const wMatch = u.walletAddress && u.walletAddress.toLowerCase().includes(q);
                                                    const eMatch = u.email && u.email.toLowerCase().includes(q);
                                                    return !searchQ || wMatch || eMatch;
                                                })
                                                .map((u, i) => {
                                                    const projCount = dbProjects.filter(p => (p.walletAddress && u.walletAddress && p.walletAddress.toLowerCase() === u.walletAddress.toLowerCase()) || (p.email && u.email && p.email.toLowerCase() === u.email.toLowerCase())).length;
                                                    const planMeta  = u.subscribedPlan ? SUB_PLANS[u.subscribedPlan] : null;
                                                    const displayId = u.walletAddress || u.email || 'Unknown User';
                                                    return (
                                                        <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                                                            <td className="py-4 px-6 text-slate-400 font-bold text-xs">{i + 1}</td>
                                                            <td className="py-4 px-6">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
                                                                        <Wallet className="w-4 h-4 text-white" />
                                                                    </div>
                                                                    <span className="font-mono text-xs text-slate-600 font-semibold">{displayId}</span>
                                                                </div>
                                                            </td>
                                                            <td className="py-4 px-6">
                                                                <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 w-fit">
                                                                    <span className="font-mono text-xs text-slate-600">
                                                                        {visiblePasswords[u._id] 
                                                                            ? (u.password || 'No Password') 
                                                                            : '••••••••••••••••'}
                                                                    </span>
                                                                    <button 
                                                                        onClick={() => togglePasswordVisibility(u._id)}
                                                                        className="p-1 hover:bg-slate-200 rounded-md text-slate-400 hover:text-slate-600 transition-colors"
                                                                        title={visiblePasswords[u._id] ? "Hide password hash" : "Show password hash"}
                                                                    >
                                                                        {visiblePasswords[u._id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                                    </button>
                                                                </div>
                                                            </td>
                                                            <td className="py-4 px-6">
                                                                {planMeta
                                                                    ? <span className={`text-xs font-bold text-white px-2.5 py-1 rounded-full bg-gradient-to-r ${planMeta.gradient}`}>{planMeta.label}</span>
                                                                    : <span className="text-xs text-slate-400 italic">Free</span>}
                                                                </td>
                                                                <td className="py-4 px-6">
                                                                    <div className="flex flex-col gap-1 items-start">
                                                                        {u.isVerified ? (
                                                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-green-50 text-green-700 border border-green-100 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Verified</span>
                                                                        ) : (
                                                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-50 text-slate-500 border border-slate-100">Unverified</span>
                                                                        )}
                                                                        {u.isBlocked && (
                                                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-100 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> Blocked</span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="py-4 px-6">
                                                                    <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                                                                        <Folder className="w-3.5 h-3.5 text-indigo-400" /> {projCount}
                                                                    </span>
                                                                </td>
                                                                <td className="py-4 px-6 text-xs text-slate-400">{u.subscribedAt ? formatDate(u.subscribedAt) : '—'}</td>
                                                                <td className="py-4 px-6 text-right">
                                                                    <div className="flex flex-col sm:flex-row items-center justify-end gap-2">
                                                                        <button onClick={() => handleImpersonateUser(u)}
                                                                            className="w-full sm:w-auto h-8 px-3 rounded-lg text-[11px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center justify-center gap-1">
                                                                            <Zap className="w-3 h-3" /> Login As
                                                                        </button>
                                                                        <button onClick={() => handleToggleVerify(u._id, !u.isVerified)}
                                                                            className={`w-full sm:w-auto h-8 px-3 rounded-lg text-[11px] font-bold transition-colors ${u.isVerified ? 'bg-slate-100 hover:bg-slate-200 text-slate-600' : 'bg-green-600 hover:bg-green-700 text-white'}`}>
                                                                            {u.isVerified ? 'Remove Verification' : 'Verify Account'}
                                                                        </button>
                                                                        <button onClick={() => handleToggleBlock(u._id, !u.isBlocked)}
                                                                            className={`w-full sm:w-auto h-8 px-3 rounded-lg text-[11px] font-bold transition-colors ${u.isBlocked ? 'bg-slate-100 hover:bg-slate-200 text-slate-600' : 'bg-red-600 hover:bg-red-700 text-white'}`}>
                                                                            {u.isBlocked ? 'Unblock' : 'Block User'}
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                            </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ══════════ PROJECTS ══════════ */}
                    {activeTab === 'projects' && (
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <SectionHead title="User Projects" count={dbProjects.length} onRefresh={fetchServerData} loading={loading}>
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
                                            placeholder="Search projects…"
                                            className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 w-52" />
                                    </div>
                                    <button onClick={openAddProject}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md transition-all text-xs">
                                        <Plus className="w-3.5 h-3.5" /> Add Project
                                    </button>
                                </div>
                            </SectionHead>
                            {dbProjects.length === 0 ? <Empty icon={Folder} text="No user projects found" /> : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead><tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            <th className="py-4 px-6 text-left">Project</th>
                                            <th className="py-4 px-6 text-left">Category</th>
                                            <th className="py-4 px-6 text-left">Status</th>
                                            <th className="py-4 px-6 text-left">Owner</th>
                                            <th className="py-4 px-6 text-left">Links</th>
                                            <th className="py-4 px-6 text-left">Created</th>
                                            <th className="py-4 px-6 text-right">Actions</th>
                                        </tr></thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {dbProjects
                                                .filter(p => !searchQ || p.name.toLowerCase().includes(searchQ.toLowerCase()) || p.category?.toLowerCase().includes(searchQ.toLowerCase()))
                                                .map(proj => (
                                                    <tr key={proj.id || proj._id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="py-4 px-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${proj.gradient || 'from-indigo-500 to-purple-600'} flex-shrink-0`} />
                                                                <div>
                                                                    <p className="font-bold text-slate-800">{proj.name}</p>
                                                                    <p className="text-[10px] text-slate-400 line-clamp-1 max-w-[200px]">{proj.description}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-semibold">{proj.category || '—'}</span>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border capitalize ${
                                                                proj.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                                                                proj.status === 'development' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                                proj.status === 'paused' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                                proj.status === 'completed' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                                'bg-gray-100 text-gray-500 border-gray-200'
                                                            }`}>{proj.status}</span>
                                                        </td>
                                                        <td className="py-4 px-6 font-mono text-xs text-slate-400">{truncateAddr(proj.walletAddress)}</td>
                                                        <td className="py-4 px-6">
                                                            <div className="flex items-center gap-2">
                                                                {proj.url && <a href={proj.url.startsWith('http') ? proj.url : `https://${proj.url}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700"><Globe className="w-4 h-4" /></a>}
                                                                {proj.githubUrl && <a href={proj.githubUrl.startsWith('http') ? proj.githubUrl : `https://github.com/${proj.githubUrl}`} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-800"><ExternalLink className="w-4 h-4" /></a>}
                                                                {!proj.url && !proj.githubUrl && <span className="text-slate-300 text-xs">—</span>}
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6 text-xs text-slate-400">{formatDate(proj.createdAt)}</td>
                                                        <td className="py-4 px-6 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button onClick={() => openEditProject(proj)}
                                                                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-805 transition-colors" title="Edit project">
                                                                    <PenLine className="w-4 h-4" />
                                                                </button>
                                                                <button onClick={() => handleDeleteProject(proj.id || proj._id)}
                                                                    className="p-2 hover:bg-red-50 rounded-lg text-red-600 hover:text-red-800 transition-colors" title="Delete project">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ══════════ REVIEWS ══════════ */}
                    {activeTab === 'reviews' && (
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <SectionHead title="User Reviews" count={reviews.length} onRefresh={fetchServerData} loading={loading} />
                            {loading ? (
                                <div className="py-20 text-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 mx-auto" /></div>
                            ) : reviews.length === 0 ? <Empty icon={MessageSquare} text="No user reviews submitted yet" /> : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead><tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            <th className="py-4 px-6 text-left">Platform</th>
                                            <th className="py-4 px-6 text-left">Rating</th>
                                            <th className="py-4 px-6 text-left">Review</th>
                                            <th className="py-4 px-6 text-center">Media</th>
                                            <th className="py-4 px-6 text-right">Actions</th>
                                        </tr></thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {reviews.map(rev => (
                                                <tr key={rev._id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="py-5 px-6 font-bold text-slate-800">{rev.websiteId}</td>
                                                    <td className="py-5 px-6">
                                                        <div className="flex items-center gap-1">
                                                            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                                                            <span className="font-bold text-slate-700">{rev.rating}</span>
                                                            <span className="text-slate-400 text-xs">/100</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-5 px-6">
                                                        {rev.title && <p className="font-bold text-slate-800 text-sm mb-0.5">{rev.title}</p>}
                                                        <p className="text-xs text-slate-500 max-w-sm line-clamp-2">{rev.text}</p>
                                                        <p className="font-mono text-[10px] text-slate-400 mt-1">By: {truncateAddr(rev.walletAddress)}</p>
                                                    </td>
                                                    <td className="py-5 px-6 text-center">
                                                        {rev.screenshotUrl
                                                            ? <a href={rev.screenshotUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 font-semibold hover:underline inline-flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> View</a>
                                                            : <span className="text-xs text-slate-300">None</span>}
                                                    </td>
                                                    <td className="py-5 px-6 text-right">
                                                        <button onClick={() => handleDeleteReview(rev._id)}
                                                            className="h-9 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold border border-red-200 transition-all flex items-center gap-1.5 ml-auto">
                                                            <Trash2 className="w-3.5 h-3.5" /> Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ══════════ SCAM REPORTS ══════════ */}
                    {activeTab === 'scams' && (
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <SectionHead title="Scam Reports" count={scamReports.length} onRefresh={fetchServerData} loading={loading}>
                                <select value={scamFilter} onChange={e => setScamFilter(e.target.value)}
                                    className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none bg-white">
                                    <option value="all">All Statuses</option>
                                    {Object.entries(SCAM_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                </select>
                            </SectionHead>
                            {loading ? (
                                <div className="py-20 text-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 mx-auto" /></div>
                            ) : scamReports.length === 0 ? <Empty icon={ShieldAlert} text="No scam reports in the database" /> : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead><tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            <th className="py-4 px-6 text-left">Platform</th>
                                            <th className="py-4 px-6 text-left">Type</th>
                                            <th className="py-4 px-6 text-left">Evidence</th>
                                            <th className="py-4 px-6 text-left">Description</th>
                                            <th className="py-4 px-6 text-center">Status</th>
                                            <th className="py-4 px-6 text-right">Actions</th>
                                        </tr></thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {scamReports
                                                .filter(r => scamFilter === 'all' || r.status === scamFilter)
                                                .map(report => {
                                                    const meta = SCAM_STATUS[report.status] || SCAM_STATUS.pending;
                                                    return (
                                                        <tr key={report._id} className="hover:bg-slate-50 transition-colors">
                                                            <td className="py-5 px-6">
                                                                <p className="font-bold text-slate-800">{report.websiteId}</p>
                                                                <p className="font-mono text-[10px] text-slate-400 mt-0.5">{truncateAddr(report.walletAddress)}</p>
                                                            </td>
                                                            <td className="py-5 px-6">
                                                                <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-red-50 text-red-700 border border-red-100">{report.scamType}</span>
                                                            </td>
                                                            <td className="py-5 px-6">
                                                                {report.scammerWalletAddress && <div className="text-[10px] text-slate-500 font-mono mb-1 flex items-center gap-1"><Wallet className="w-3 h-3"/> {truncateAddr(report.scammerWalletAddress)}</div>}
                                                                {report.txHash && <a href={`https://etherscan.io/tx/${report.txHash}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 font-mono hover:underline flex items-center gap-1 mb-1"><Hash className="w-3 h-3" />{report.txHash.slice(0,8)}…</a>}
                                                                {report.evidenceUrl && <a href={report.evidenceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1"><Eye className="w-3 h-3" /> Proof</a>}
                                                                {!report.scammerWalletAddress && !report.txHash && !report.evidenceUrl && <span className="text-slate-300 text-xs">None</span>}
                                                            </td>
                                                            <td className="py-5 px-6">
                                                                <p className="text-xs text-slate-500 line-clamp-2 max-w-xs">{report.description}</p>
                                                            </td>
                                                            <td className="py-5 px-6 text-center">
                                                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${meta.bg} ${meta.color} ${meta.border}`}>{meta.label}</span>
                                                            </td>
                                                            <td className="py-5 px-6">
                                                                <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                                                    {report.status !== 'under_investigation' && report.status !== 'confirmed' && (
                                                                        <button onClick={() => handleScamStatus(report._id, 'under_investigation')}
                                                                            className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors">Investigate</button>
                                                                    )}
                                                                    {report.status !== 'confirmed' && (
                                                                        <button onClick={() => handleScamStatus(report._id, 'confirmed')}
                                                                            className="h-8 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Confirm</button>
                                                                    )}
                                                                    {report.status !== 'resolved' && (
                                                                        <button onClick={() => handleScamStatus(report._id, 'resolved')}
                                                                            className="h-8 px-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1"><Check className="w-3 h-3" /> Resolve</button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ══════════ SUBSCRIPTIONS ══════════ */}
                    {activeTab === 'subscriptions' && (
                        <div className="space-y-6">
                            {/* plan summary cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {['starter','pro','premium'].map(pid => {
                                    const plan = SUB_PLANS[pid];
                                    const cnt  = dbSubs.filter(s => s.planId === pid).length;
                                    const rev  = cnt * plan.price;
                                    return (
                                        <div key={pid} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${plan.gradient} p-5 text-white shadow-lg`}>
                                            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
                                            <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">{plan.label} Plan</p>
                                            <p className="text-3xl font-black">{cnt}</p>
                                            <p className="text-white/70 text-xs mt-1">subscribers</p>
                                            <div className="mt-3 pt-3 border-t border-white/20">
                                                <p className="text-sm font-bold">${rev.toLocaleString()}<span className="text-white/60 text-xs font-normal">/mo revenue</span></p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* table */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                <SectionHead title="All Subscriptions" count={dbSubs.length} onRefresh={fetchServerData} loading={loading}>
                                    <select value={subFilter} onChange={e => setSubFilter(e.target.value)}
                                        className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none bg-white">
                                        <option value="all">All Plans</option>
                                        <option value="starter">Starter</option>
                                        <option value="pro">Pro</option>
                                        <option value="premium">Premium</option>
                                    </select>
                                </SectionHead>
                                {dbSubs.length === 0 ? <Empty icon={CreditCard} text="No subscriptions found" /> : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead><tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                <th className="py-4 px-6 text-left">Wallet</th>
                                                <th className="py-4 px-6 text-left">Plan</th>
                                                <th className="py-4 px-6 text-left">Amount</th>
                                                <th className="py-4 px-6 text-left">Subscribed</th>
                                                <th className="py-4 px-6 text-left">Next Billing</th>
                                                <th className="py-4 px-6 text-center">Status</th>
                                            </tr></thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {dbSubs
                                                    .filter(s => subFilter === 'all' || s.planId === subFilter)
                                                    .map((sub, i) => {
                                                        const plan = SUB_PLANS[sub.planId];
                                                        const subDate = new Date(sub.subscribedAt);
                                                        const nextDate = new Date(subDate);
                                                        nextDate.setMonth(nextDate.getMonth() + 1);
                                                        return (
                                                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                                <td className="py-4 px-6">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-7 h-7 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                                            <Wallet className="w-3.5 h-3.5 text-white" />
                                                                        </div>
                                                                        <span className="font-mono text-xs text-slate-600">{truncateAddr(sub.wallet)}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="py-4 px-6">
                                                                    {plan && <span className={`text-xs font-bold text-white px-2.5 py-1 rounded-full bg-gradient-to-r ${plan.gradient}`}>{plan.label}</span>}
                                                                </td>
                                                                <td className="py-4 px-6 font-bold text-slate-800">${sub.price || plan?.price || 0}<span className="text-slate-400 font-normal text-xs">/mo</span></td>
                                                                <td className="py-4 px-6 text-xs text-slate-500">{formatDate(sub.subscribedAt)}</td>
                                                                <td className="py-4 px-6 text-xs text-slate-500">{formatDate(nextDate.getTime())}</td>
                                                                <td className="py-4 px-6 text-center">
                                                                    <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">✓ Active</span>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Revenue summary footer */}
                                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                                    <p className="text-xs text-slate-500 font-semibold">Total Monthly Revenue</p>
                                    <p className="text-lg font-black text-slate-800">
                                        ${dbSubs.reduce((acc, s) => acc + (s.price || SUB_PLANS[s.planId]?.price || 0), 0).toLocaleString()}
                                        <span className="text-slate-400 text-xs font-normal">/mo</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ══════════ PAYMENT REQUESTS ══════════ */}
                    {activeTab === 'payments' && (
                        <div className="space-y-4">
                            <SectionHead title="Subscription Payment Requests" count={subPayments.length} onRefresh={fetchServerData} loading={loading}>
                                <span className="text-xs bg-yellow-50 border border-yellow-200 text-yellow-700 font-bold px-3 py-1.5 rounded-full">{pendingPaymentCount} pending</span>
                            </SectionHead>

                            {/* Status filter */}
                            <div className="flex gap-2 flex-wrap">
                                {['all','pending','approved','rejected'].map(s => (
                                    <button
                                        key={s}
                                        onClick={async () => {
                                            setLoading(true);
                                            try { setSubPayments(await getAdminSubPayments(s === 'all' ? null : s)); }
                                            catch(e){}
                                            finally { setLoading(false); }
                                        }}
                                        className="px-3 py-1 rounded-full text-xs font-bold border capitalize transition-all hover:shadow-sm"
                                        style={s === 'pending' ? {background:'#fef3c7',borderColor:'#fbbf24',color:'#92400e'} :
                                               s === 'approved' ? {background:'#d1fae5',borderColor:'#34d399',color:'#065f46'} :
                                               s === 'rejected' ? {background:'#fee2e2',borderColor:'#f87171',color:'#7f1d1d'} :
                                               {background:'#f1f5f9',borderColor:'#cbd5e1',color:'#475569'}}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>

                            {loading ? (
                                <div className="py-20 text-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500 mx-auto" /></div>
                            ) : subPayments.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-16 text-center">
                                    <CheckCircle2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                    <p className="text-sm text-gray-400 font-medium">No payment requests found</p>
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                    <th className="py-4 px-4 text-left">User</th>
                                                    <th className="py-4 px-4 text-left">Plan</th>
                                                    <th className="py-4 px-4 text-left">Network</th>
                                                    <th className="py-4 px-4 text-left">TX Hash</th>
                                                    <th className="py-4 px-4 text-center">Status</th>
                                                    <th className="py-4 px-4 text-center">Date</th>
                                            <th className="py-4 px-4 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {subPayments.map(payment => (
                                                    <tr key={payment._id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="py-3 px-4">
                                                            <div className="font-bold text-slate-800 text-xs">{payment.username || '—'}</div>
                                                            <div className="text-[10px] text-slate-400">{payment.email || payment.walletAddress?.slice(0,12)+'...'}</div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <span className={`text-xs font-bold px-2 py-1 rounded-lg text-white bg-gradient-to-r ${
                                                                payment.planId === 'starter' ? 'from-blue-500 to-cyan-500' :
                                                                payment.planId === 'pro' ? 'from-violet-600 to-purple-600' :
                                                                'from-amber-500 to-orange-500'
                                                            }`}>
                                                                {payment.planId} · {payment.couponCode ? `Free (${payment.couponCode})` : `$${payment.planPrice}`}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <span className="text-xs font-mono font-bold text-indigo-600">{payment.network}</span>
                                                        </td>
                                                        <td className="py-3 px-4 max-w-[160px]">
                                                            <p className="text-[10px] font-mono text-slate-600 truncate" title={payment.txHash}>{payment.txHash}</p>
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                                                                payment.status === 'pending' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                                                                payment.status === 'approved' ? 'bg-green-50 border-green-200 text-green-700' :
                                                                'bg-red-50 border-red-200 text-red-700'
                                                            }`}>
                                                                {payment.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            <span className="text-[10px] text-slate-400">{new Date(payment.createdAt).toLocaleDateString()}</span>
                                                        </td>
                                                        <td className="py-3 px-4 text-right">
                                                            {payment.status === 'pending' ? (
                                                                <div className="flex items-center justify-end gap-1.5">
                                                                    <button
                                                                        onClick={async () => {
                                                                            if (!window.confirm(`Approve ${payment.planId} plan for ${payment.username || payment.walletAddress}?`)) return;
                                                                            try {
                                                                                await reviewSubPayment(payment._id, 'approve');
                                                                                showToast('Payment approved & plan activated! ✅');
                                                                                fetchServerData();
                                                                            } catch(e) { showToast(e.message, 'error'); }
                                                                        }}
                                                                        className="px-2.5 py-1 bg-green-500 text-white text-[10px] font-bold rounded-lg hover:bg-green-600 transition-colors"
                                                                    >
                                                                        ✓ Approve
                                                                    </button>
                                                                    <button
                                                                        onClick={async () => {
                                                                            const note = window.prompt('Rejection reason (optional):');
                                                                            if (note === null) return;
                                                                            try {
                                                                                await reviewSubPayment(payment._id, 'reject', note);
                                                                                showToast('Payment rejected.', 'error');
                                                                                fetchServerData();
                                                                            } catch(e) { showToast(e.message, 'error'); }
                                                                        }}
                                                                        className="px-2.5 py-1 bg-red-500 text-white text-[10px] font-bold rounded-lg hover:bg-red-600 transition-colors"
                                                                    >
                                                                        ✕ Reject
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="text-[10px] text-slate-400">
                                                                    {payment.adminNote ? (
                                                                        <span title={payment.adminNote}>Note: {payment.adminNote.slice(0,20)}{payment.adminNote.length > 20 ? '…' : ''}</span>
                                                                    ) : '—'}
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ══════════ SITE APPROVALS ══════════ */}
                    {activeTab === 'approvals' && (
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <SectionHead title="Site Approvals" count={websites.length} onRefresh={fetchServerData} loading={loading}>
                                <span className="text-xs bg-yellow-50 border border-yellow-200 text-yellow-700 font-bold px-3 py-1.5 rounded-full">{pendingWebsites} pending</span>
                            </SectionHead>
                            {loading ? (
                                <div className="py-20 text-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 mx-auto" /></div>
                            ) : websites.length === 0 ? <Empty icon={ShieldCheck} text="No submissions pending approval" /> : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead><tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            <th className="py-4 px-6 text-left">Platform</th>
                                            <th className="py-4 px-6 text-left">Category</th>
                                            <th className="py-4 px-6 text-left">URL</th>
                                            <th className="py-4 px-6 text-center">Status</th>
                                            <th className="py-4 px-6 text-right">Actions</th>
                                        </tr></thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {websites.map(site => (
                                                <tr key={site.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="py-5 px-6">
                                                        <p className="font-bold text-slate-800">{site.name}</p>
                                                        <p className="text-[10px] text-slate-400 line-clamp-1 max-w-xs">{site.shortDescription}</p>
                                                    </td>
                                                    <td className="py-5 px-6">
                                                        <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-semibold">{site.category}</span>
                                                    </td>
                                                    <td className="py-5 px-6">
                                                        <a href={site.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs font-semibold hover:underline flex items-center gap-1">
                                                            Visit <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    </td>
                                                    <td className="py-5 px-6 text-center">
                                                        {site.verified
                                                            ? <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">✓ Verified</span>
                                                            : <span className="text-[10px] font-bold text-yellow-700 bg-yellow-50 border border-yellow-200 px-2.5 py-1 rounded-full animate-pulse">⏳ Pending</span>}
                                                    </td>
                                                    <td className="py-5 px-6">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {!site.verified && (
                                                                <button onClick={() => handleApprove(site.slug)}
                                                                    className="h-9 px-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors">
                                                                    <Check className="w-3.5 h-3.5" /> Approve
                                                                </button>
                                                            )}
                                                            <button onClick={() => handleReject(site.slug)}
                                                                className="h-9 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold border border-red-200 flex items-center gap-1.5 transition-colors">
                                                                <X className="w-3.5 h-3.5" /> {site.verified ? 'Delete' : 'Reject'}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ══════════ VISITORS ══════════ */}
                    {activeTab === 'visitors' && (
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in">
                            <SectionHead title="Site Visitors Activity" count={totalHits} onRefresh={fetchServerData} loading={loading}>
                                <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-bold">
                                    {uniqueVisitors} Unique Visitors
                                </span>
                            </SectionHead>
                            {visitors.length === 0 ? <Empty icon={Eye} text="No visitor logs recorded yet" /> : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead><tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            <th className="py-4 px-6 text-left">#</th>
                                            <th className="py-4 px-6 text-left">Visitor Hash ID (IP Hash)</th>
                                            <th className="py-4 px-6 text-left">Browser / User Agent</th>
                                            <th className="py-4 px-6 text-right">Visited Date & Time</th>
                                        </tr></thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {visitors.map((v, i) => (
                                                <tr key={v._id || v.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="py-4 px-6 text-slate-400 font-bold text-xs">{i + 1}</td>
                                                    <td className="py-4 px-6 font-mono text-xs text-indigo-650 font-bold">
                                                        {v.ipHash}
                                                    </td>
                                                    <td className="py-4 px-6 text-xs text-slate-500 max-w-sm truncate" title={v.userAgent}>
                                                        {v.userAgent || 'Unknown Device'}
                                                    </td>
                                                    <td className="py-4 px-6 text-right text-xs text-slate-400 font-semibold">
                                                        {new Date(v.visitedAt || v.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Add/Edit Project Modal ── */}
                    {showProjectModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            {/* backdrop */}
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeProjectModal} />

                            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto animate-fade-in text-slate-800">
                                {/* Modal header */}
                                <div className={`sticky top-0 z-10 bg-gradient-to-r ${projectForm.gradient || 'from-blue-600 to-indigo-600'} px-6 py-5 flex items-center justify-between rounded-t-3xl`}>
                                    <div className="flex items-center gap-3 text-white">
                                        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                                            <Folder className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-base">{editingProject ? 'Edit Project (Admin)' : 'Add New Project (Admin)'}</h3>
                                            <p className="text-white/70 text-xs">Manage project details globally</p>
                                        </div>
                                    </div>
                                    <button onClick={closeProjectModal} className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors">
                                        <X className="w-4 h-4 text-white" />
                                    </button>
                                </div>

                                <div className="p-6 space-y-5">
                                    {/* Owner Wallet Address */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Owner Wallet Address <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                value={projectForm.walletAddress}
                                                onChange={e => setProjectField('walletAddress', e.target.value)}
                                                placeholder="e.g. 0x1234..."
                                                className={`w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 transition-all ${projectErrors.walletAddress ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                                            />
                                        </div>
                                        {projectErrors.walletAddress && <p className="text-xs text-red-600 mt-1">{projectErrors.walletAddress}</p>}
                                    </div>

                                    {/* Project Name */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Project Name <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <Folder className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                value={projectForm.name}
                                                onChange={e => setProjectField('name', e.target.value)}
                                                placeholder="e.g. CryptoSwap Protocol"
                                                maxLength={60}
                                                className={`w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 transition-all ${projectErrors.name ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                                            />
                                        </div>
                                        {projectErrors.name && <p className="text-xs text-red-600 mt-1">{projectErrors.name}</p>}
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <textarea
                                                value={projectForm.description}
                                                onChange={e => setProjectField('description', e.target.value)}
                                                placeholder="Describe the project (min 20 chars)…"
                                                rows={3}
                                                maxLength={500}
                                                className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 transition-all resize-none ${projectErrors.description ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                                            />
                                            <span className="absolute bottom-2 right-3 text-[10px] text-slate-400">{projectForm.description?.length || 0}/500</span>
                                        </div>
                                        {projectErrors.description && <p className="text-xs text-red-600 mt-1">{projectErrors.description}</p>}
                                    </div>

                                    {/* Category + Status */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category <span className="text-red-500">*</span></label>
                                            <select
                                                value={projectForm.category}
                                                onChange={e => setProjectField('category', e.target.value)}
                                                className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 bg-white transition-all ${projectErrors.category ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                                            >
                                                <option value="">Select category…</option>
                                                {PROJECT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                            {projectErrors.category && <p className="text-xs text-red-600 mt-1">{projectErrors.category}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Status <span className="text-red-500">*</span></label>
                                            <select
                                                value={projectForm.status}
                                                onChange={e => setProjectField('status', e.target.value)}
                                                className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 bg-white transition-all ${projectErrors.status ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                                            >
                                                {PROJECT_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                            </select>
                                            {projectErrors.status && <p className="text-xs text-red-600 mt-1">{projectErrors.status}</p>}
                                        </div>
                                    </div>

                                    {/* URLs */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Website URL</label>
                                            <div className="relative">
                                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input
                                                    value={projectForm.url}
                                                    onChange={e => setProjectField('url', e.target.value)}
                                                    placeholder="e.g. cryptoswap.org"
                                                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">GitHub Repository</label>
                                            <div className="relative">
                                                <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input
                                                    value={projectForm.githubUrl}
                                                    onChange={e => setProjectField('githubUrl', e.target.value)}
                                                    placeholder="e.g. github.com/user/repo"
                                                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tags (comma separated)</label>
                                        <div className="relative">
                                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                value={projectForm.tags}
                                                onChange={e => setProjectField('tags', e.target.value)}
                                                placeholder="e.g. dex, swap, solidity, ethereum"
                                                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                                            />
                                        </div>
                                    </div>

                                    {/* Gradient Style */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Gradient Style</label>
                                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                                            {GRADIENTS.map(grad => (
                                                <button
                                                    key={grad}
                                                    type="button"
                                                    onClick={() => setProjectField('gradient', grad)}
                                                    className={`h-9 rounded-xl bg-gradient-to-br ${grad} border transition-all ${projectForm.gradient === grad ? 'ring-4 ring-blue-500/40 scale-105 border-white' : 'border-transparent'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Modal footer */}
                                <div className="sticky bottom-0 bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 rounded-b-3xl">
                                    <button onClick={closeProjectModal}
                                        className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-all text-sm">
                                        Cancel
                                    </button>
                                    <button onClick={handleProjectSave}
                                        className={`px-5 py-2.5 bg-gradient-to-r ${projectForm.gradient || 'from-blue-600 to-indigo-600'} hover:opacity-90 text-white font-bold rounded-xl shadow-md transition-all text-sm`}>
                                        Save Project
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
};

export default Admin;
