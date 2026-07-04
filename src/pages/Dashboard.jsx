import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Wallet, Copy, Check, LogOut, ExternalLink, Star, Bookmark,
    TrendingUp, Shield, ChevronRight, Activity, Globe,
    Zap, Award, Users, ArrowUpRight, ArrowDownRight,
    BarChart2, Eye, Heart, MessageSquare, User, Edit3,
    Camera, Twitter, Github, Linkedin, Link2, Save,
    X, AtSign, FileText, MapPin, Calendar, CheckCircle2,
    LayoutDashboard, Sparkles, AlertTriangle, Flag, Send,
    RefreshCw, Clock, Hash, Search, Plus, Info,
    Folder, Code2, Rocket, Tag, Trash2, PenLine, GitBranch,
    CreditCard, Crown, Gem, BadgeCheck, Sparkle, ChevronDown, UserCheck
} from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import { useWallet } from '../contexts/WalletContext';
import { useBookmark } from '../contexts/BookmarkContext';
import { getWebsites, getMyScamReports, submitScamReport, getDbUser, updateDbUser, updateDbUserSubscription, getDbUserProjects, addDbUserProject, updateDbUserProject, deleteDbUserProject, getUserReviews, deleteReview, getDbUserReferrals } from '../services/api';

/* ─────────────────── tiny reusable atoms ─────────────────── */

const StatCard = ({ icon: Icon, label, value, change, color, bg }) => (
    <div className={`relative overflow-hidden rounded-2xl p-5 ${bg} border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300`}>
        <div className="flex items-start justify-between">
            <div>
                <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">{label}</p>
                <p className={`text-3xl font-black ${color}`}>{value}</p>
                {change !== undefined && (
                    <p className={`text-xs font-semibold mt-1 flex items-center gap-1 ${change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(change)}% this week
                    </p>
                )}
            </div>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color.replace('text-', 'bg-').replace('700', '100').replace('600', '100')}`}>
                <Icon className={`w-5 h-5 ${color}`} />
            </div>
        </div>
    </div>
);

const ActivityItem = ({ icon: Icon, color, bg, title, desc, time }) => (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded-xl transition-colors">
        <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
            <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800">{title}</p>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{desc}</p>
        </div>
        <span className="text-xs text-gray-400 flex-shrink-0 mt-1">{time}</span>
    </div>
);

const QuickActionCard = ({ icon: Icon, label, desc, to, gradient }) => (
    <Link to={to}>
        <div className={`relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br ${gradient} text-white cursor-pointer hover:scale-[1.03] hover:shadow-xl transition-all duration-300 group`}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8" />
            <Icon className="w-7 h-7 mb-2 relative z-10" />
            <p className="font-bold text-sm relative z-10">{label}</p>
            <p className="text-[11px] text-white/75 mt-0.5 relative z-10 leading-tight">{desc}</p>
        </div>
    </Link>
);

/* ─────────────────── avatar palette ─────────────────── */
const AVATAR_BG = [
    'from-blue-500 to-indigo-600',
    'from-purple-500 to-pink-600',
    'from-green-500 to-emerald-600',
    'from-orange-500 to-red-500',
    'from-cyan-500 to-blue-500',
    'from-rose-500 to-pink-500',
    'from-yellow-400 to-orange-500',
    'from-teal-500 to-cyan-600',
];

const EMOJI_AVATARS = ['🦊', '🐉', '🦁', '🐺', '🦅', '🐋', '🦄', '🤖', '👾', '🧙', '🏴‍☠️', '🌊'];

/* ─────────────────── PROFILE EDITOR ─────────────────── */
const PROFILE_KEY = 'cs_user_profile';

const defaultProfile = {
    displayName: '',
    bio: '',
    location: '',
    website: '',
    twitter: '',
    github: '',
    linkedin: '',
    avatarEmoji: '🦊',
    avatarBg: 'from-blue-500 to-indigo-600',
    joinedLabel: '',
};

function loadProfile() {
    try { return { ...defaultProfile, ...JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}') }; }
    catch { return defaultProfile; }
}
function saveProfile(p) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
}

/* ─────────────────── TABS ─────────────────── */
const SCAM_TYPES = [
    'Phishing / Fake Site',
    'Rug Pull / Exit Scam',
    'Pump & Dump',
    'Smart Contract Exploit',
    'Fake Token / Airdrop',
    'Ponzi / High-Yield Scheme',
    'Wallet Drainer',
    'Other',
];

const STATUS_META = {
    pending:             { label: 'Pending',            color: 'text-yellow-700', bg: 'bg-yellow-100', border: 'border-yellow-200', dot: 'bg-yellow-500' },
    under_investigation: { label: 'Under Review',       color: 'text-blue-700',   bg: 'bg-blue-100',   border: 'border-blue-200',   dot: 'bg-blue-500' },
    confirmed:           { label: 'Confirmed Scam',     color: 'text-red-700',    bg: 'bg-red-100',    border: 'border-red-200',    dot: 'bg-red-500' },
    resolved:            { label: 'Resolved',           color: 'text-green-700',  bg: 'bg-green-100',  border: 'border-green-200',  dot: 'bg-green-500' },
};

/* ─────────────────── PROJECT MANAGEMENT ─────────────────── */
const PROJECTS_KEY = (addr) => `cs_projects_${addr}`;

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
    name: '', description: '', url: '', githubUrl: '',
    category: '', status: 'development', tags: '', gradient: 'from-blue-500 to-indigo-600',
};

function loadProjects(addr) {
    if (!addr) return [];
    try { return JSON.parse(localStorage.getItem(PROJECTS_KEY(addr)) || '[]'); }
    catch { return []; }
}
function saveProjects(addr, list) {
    if (!addr) return;
    localStorage.setItem(PROJECTS_KEY(addr), JSON.stringify(list));
}

/* ─────────────────── SUBSCRIPTION ─────────────────── */
const SUB_KEY = (addr) => `cs_subscription_${addr}`;

const PLANS = [
    {
        id: 'starter',
        name: 'Starter',
        price: 99,
        period: 'one-time',
        gradient: 'from-blue-500 to-cyan-500',
        glow: 'shadow-blue-200',
        icon: Zap,
        badge: null,
        tagline: '30 Days Listing',
        features: [
            { text: '30 Days Listing',          included: true },
            { text: 'Project Profile',           included: true },
            { text: 'Token Information',         included: true },
            { text: 'Website & Social Links',    included: true },
            { text: 'Whitepaper Link',           included: true },
            { text: 'Category Listing',          included: true },
            { text: 'Community Badge',            included: true },
            { text: 'Email Support',             included: true },
        ],
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 199,
        period: 'one-time',
        gradient: 'from-violet-600 to-purple-600',
        glow: 'shadow-purple-200',
        icon: Crown,
        badge: 'Most Popular',
        tagline: '60 Days Listing & Features',
        features: [
            { text: 'Everything in Starter',     included: true },
            { text: '60 Days Listing',           included: true },
            { text: 'Featured Project Badge',    included: true },
            { text: 'Homepage Featured Section', included: true },
            { text: 'Priority Review',           included: true },
            { text: 'Social Media Promotion (1 Post)', included: true },
            { text: 'Priority Support',          included: true },
        ],
    },
    {
        id: 'premium',
        name: 'Premium',
        price: 299,
        period: 'one-time',
        gradient: 'from-amber-500 to-orange-500',
        glow: 'shadow-orange-200',
        icon: Gem,
        badge: 'Best Value',
        tagline: '90 Days Premium Listing',
        features: [
            { text: 'Everything in Pro',         included: true },
            { text: '90 Days Premium Listing',   included: true },
            { text: 'Homepage Hero Placement',   included: true },
            { text: 'Gold Verified Badge',       included: true },
            { text: 'Homepage Slider Feature',   included: true },
            { text: 'Newsletter Feature',        included: true },
            { text: 'Priority Support',          included: true },
        ],
    },
];

const FAQ = [
    { q: 'Can I upgrade or downgrade my plan?', a: 'Yes — you can switch plans at any time. Upgrades take effect immediately; downgrades apply at the next billing cycle.' },
    { q: 'Is there a free trial?', a: 'Each plan comes with a 7-day money-back guarantee. No questions asked.' },
    { q: 'How do payments work?', a: 'Payments are billed monthly to your connected payment method. Crypto payments (ETH, USDC) are supported.' },
    { q: 'What happens if I cancel?', a: 'Your plan stays active until the end of the billing period. After that your account reverts to the free tier.' },
];

function loadSubscription(addr) {
    if (!addr) return null;
    try { return JSON.parse(localStorage.getItem(SUB_KEY(addr)) || 'null'); }
    catch { return null; }
}
function saveSubscription(addr, data) {
    if (!addr) return;
    localStorage.setItem(SUB_KEY(addr), JSON.stringify(data));
}

const TABS = [
    { id: 'overview',      label: 'Overview',      icon: LayoutDashboard },
    { id: 'profile',       label: 'My Profile',    icon: User },
    { id: 'projects',      label: 'Projects',      icon: Folder },
    { id: 'reviews',       label: 'My Reviews',    icon: Star },
    { id: 'subscription',  label: 'Subscription',  icon: CreditCard },
    { id: 'referrals',     label: 'Referrals',     icon: Users },
    { id: 'reports',       label: 'Scam Reports',  icon: AlertTriangle },
    { id: 'leads',         label: 'My Leads',      icon: UserCheck },
];

const getDeterministicViews = (name) => {
    if (!name) return 0;
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return (Math.abs(hash % 9800) + 1200).toLocaleString();
};

/* ─────────────────── MAIN COMPONENT ─────────────────── */
const Dashboard = () => {
    const { isConnected, walletAddress, walletType, connectedAt, getTruncatedAddress, disconnectWallet, user } = useWallet();

    /* subscription state */
    const [activePlan, setActivePlan]         = useState(() => loadSubscription(walletAddress));
    const [subConfirm, setSubConfirm]         = useState(null);  // plan id pending confirm
    const [subSuccess, setSubSuccess]         = useState(false);
    const [openFaq, setOpenFaq]               = useState(null);
    const [txHash, setTxHash]                 = useState('');
    const [selectedNetwork, setSelectedNetwork] = useState('ERC20');
    const [paymentSubmitting, setPaymentSubmitting] = useState(false);
    const [paymentSubmitted, setPaymentSubmitted]   = useState(false);
    const [paymentError, setPaymentError]           = useState('');
    const [pendingPayments, setPendingPayments]     = useState([]);
    const [couponInput, setCouponInput]             = useState('');
    const [couponError, setCouponError]             = useState('');
    const [couponApplied, setCouponApplied]         = useState(false);
    const [discountedPrice, setDiscountedPrice]     = useState(null);

    /* project management state */
    const [projects, setProjects]               = useState([]);
    const [projectFilter, setProjectFilter]     = useState('all');
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [editingProject, setEditingProject]   = useState(null); // null = add, obj = edit
    const [projectForm, setProjectForm]         = useState(BLANK_PROJECT);
    const [projectErrors, setProjectErrors]     = useState({});
    const [deleteConfirm, setDeleteConfirm]     = useState(null); // id to confirm
    const [projectSaved, setProjectSaved]       = useState(false);
    const [showSubRequiredModal, setShowSubRequiredModal] = useState(false);

    /* referral state */
    const [referrals, setReferrals]             = useState([]);
    const [referralsLoading, setReferralsLoading] = useState(false);
    const [copiedLink, setCopiedLink]           = useState(false);

    /* scam reports state */
    const [myReports, setMyReports]           = useState([]);
    const [reportsLoading, setReportsLoading] = useState(false);
    const [reportsError, setReportsError]     = useState(null);
    const [showReportForm, setShowReportForm] = useState(false);
    const [reportFilter, setReportFilter]     = useState('all');
    const [submitting, setSubmitting]         = useState(false);
    const [submitSuccess, setSubmitSuccess]   = useState(false);
    const [reportForm, setReportForm]         = useState({
        websiteId: '',
        scamType: '',
        description: '',
        scammerWalletAddress: '',
        txHash: '',
        evidenceUrl: '',
    });
    const [reportFormErrors, setReportFormErrors] = useState({});
    
    /* reviews state */
    const [myReviews, setMyReviews]           = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [reviewsError, setReviewsError]     = useState(null);

    /* leads state */
    const [leads, setLeads]                   = useState([]);
    const [leadsLoading, setLeadsLoading]     = useState(false);

    const { bookmarks } = useBookmark();
    const [copied, setCopied] = useState(false);
    const [recentSites, setRecentSites] = useState([]);
    const [loadingSites, setLoadingSites] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const navigate = useNavigate();

    /* profile state */
    const [profile, setProfile] = useState(loadProfile);
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(profile);
    const [saved, setSaved] = useState(false);
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);
    const avatarRef = useRef(null);

    useEffect(() => { if (!isConnected) navigate('/'); }, [isConnected, navigate]);

    useEffect(() => {
        getWebsites({ featured: true, limit: 4 })
            .then(setRecentSites)
            .catch(console.error)
            .finally(() => setLoadingSites(false));
    }, []);

    /* load profile, subscription, referrals, and projects from database whenever wallet address is available */
    useEffect(() => {
        const loadDbData = async () => {
            if (!walletAddress) return;
            try {
                const storedRef = localStorage.getItem('cs_referred_by');
                const user = await getDbUser(walletAddress, storedRef);
                if (storedRef && user) {
                    localStorage.removeItem('cs_referred_by');
                }
                if (user) {
                    const profileData = {
                        displayName: user.displayName || '',
                        bio: user.bio || '',
                        location: user.location || '',
                        website: user.website || '',
                        twitter: user.twitter || '',
                        github: user.github || '',
                        linkedin: user.linkedin || '',
                        avatarEmoji: user.avatarEmoji || '🦊',
                        avatarBg: user.avatarBg || 'from-blue-500 to-indigo-600',
                        joinedLabel: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''
                    };
                    setProfile(profileData);
                    setDraft(profileData);
                    
                    if (user.subscribedPlan) {
                        setActivePlan({
                            planId: user.subscribedPlan,
                            subscribedAt: user.subscribedAt,
                            price: PLANS.find(p => p.id === user.subscribedPlan)?.price || 0
                        });
                    } else {
                        setActivePlan(null);
                    }
                }
                
                const projs = await getDbUserProjects(walletAddress);
                setProjects(projs);
                const revs = await getUserReviews(walletAddress);
                setMyReviews(revs);

                // Fetch user's leads on mount so they can be shown on project cards
                try {
                    const API_URL = import.meta.env.VITE_API_URL || '/api';
                    const resLeads = await fetch(`${API_URL}/users/${walletAddress}/leads`);
                    if (resLeads.ok) {
                        const dataLeads = await resLeads.json();
                        setLeads(dataLeads || []);
                    }
                } catch (e) {
                    console.error('Error fetching leads on mount:', e);
                }
                
                setReferralsLoading(true);
                const refs = await getDbUserReferrals(walletAddress);
                setReferrals(refs);
                setReferralsLoading(false);
            } catch (err) {
                console.error('Error loading data from database:', err);
            }
        };
        
        loadDbData();
    }, [walletAddress]);

    const openAddProject = () => {
        if (!activePlan) {
            setShowSubRequiredModal(true);
            return;
        }
        setEditingProject(null);
        setProjectForm(BLANK_PROJECT);
        setProjectErrors({});
        setShowProjectModal(true);
    };
    const openEditProject = (proj) => {
        setEditingProject(proj);
        setProjectForm({ ...proj, tags: Array.isArray(proj.tags) ? proj.tags.join(', ') : proj.tags || '' });
        setProjectErrors({});
        setShowProjectModal(true);
    };
    const closeProjectModal = () => { setShowProjectModal(false); setEditingProject(null); setProjectErrors({}); };

    const validateProject = () => {
        const e = {};
        if (!projectForm.name.trim())     e.name     = 'Project name is required';
        if (!projectForm.description.trim() || projectForm.description.trim().length < 20)
            e.description = 'Description must be at least 20 characters';
        if (!projectForm.category)        e.category = 'Select a category';
        if (!projectForm.status)          e.status   = 'Select a status';
        setProjectErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleProjectSave = async () => {
        if (!validateProject()) return;
        if (!editingProject && !activePlan) {
            setShowSubRequiredModal(true);
            return;
        }
        const tagsArr = projectForm.tags
            ? projectForm.tags.split(',').map(t => t.trim()).filter(Boolean)
            : [];
        try {
            if (editingProject) {
                const updatedProj = await updateDbUserProject(walletAddress, editingProject.id, {
                    ...projectForm,
                    tags: tagsArr
                });
                setProjects(projects.map(p => p.id === editingProject.id ? updatedProj : p));
            } else {
                const newProj = await addDbUserProject(walletAddress, {
                    ...projectForm,
                    tags: tagsArr
                });
                setProjects([newProj, ...projects]);
            }
            closeProjectModal();
            setProjectSaved(true);
            setTimeout(() => setProjectSaved(false), 3000);
        } catch (err) {
            console.error('Failed to save project:', err);
        }
    };

    const handleDeleteProject = async (id) => {
        try {
            await deleteDbUserProject(walletAddress, id);
            setProjects(projects.filter(p => p.id !== id));
            setDeleteConfirm(null);
        } catch (err) {
            console.error('Failed to delete project:', err);
        }
    };

    const setProjectField = (k, v) => setProjectForm(f => ({ ...f, [k]: v }));

    const fetchMyReports = async () => {
        if (!walletAddress) return;
        setReportsLoading(true);
        setReportsError(null);
        try {
            const data = await getMyScamReports(walletAddress);
            setMyReports(data);
        } catch (e) {
            setReportsError('Failed to load reports.');
        } finally {
            setReportsLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'reports' && walletAddress) fetchMyReports();
    }, [activeTab, walletAddress]);

    const validateReportForm = () => {
        const errs = {};
        if (!reportForm.websiteId.trim()) errs.websiteId = 'Platform slug is required';
        if (!reportForm.scamType)         errs.scamType  = 'Select a scam type';
        if (!reportForm.description.trim() || reportForm.description.trim().length < 30)
            errs.description = 'Description must be at least 30 characters';
        setReportFormErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        if (!validateReportForm()) return;
        setSubmitting(true);
        try {
            await submitScamReport(reportForm.websiteId.trim().toLowerCase(), {
                walletAddress,
                scamType: reportForm.scamType,
                description: reportForm.description,
                txHash: reportForm.txHash,
                evidenceUrl: reportForm.evidenceUrl,
            });
            setSubmitSuccess(true);
            setShowReportForm(false);
            setReportForm({ websiteId: '', scamType: '', description: '', txHash: '', evidenceUrl: '' });
            setReportFormErrors({});
            await fetchMyReports();
            setTimeout(() => setSubmitSuccess(false), 4000);
        } catch (err) {
            setReportFormErrors({ submit: err.message || 'Failed to submit report. Check the platform slug.' });
        } finally {
            setSubmitting(false);
        }
    };

    const fetchMyReviews = async () => {
        if (!walletAddress) return;
        setReviewsLoading(true);
        setReviewsError(null);
        try {
            const data = await getUserReviews(walletAddress);
            setMyReviews(data);
        } catch (e) {
            setReviewsError('Failed to load reviews.');
        } finally {
            setReviewsLoading(false);
        }
    };

    const handleDeleteReview = async (id) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        try {
            await deleteReview(id);
            setMyReviews(myReviews.filter(r => r._id !== id && r.id !== id));
        } catch (err) {
            alert('Failed to delete review: ' + err.message);
        }
    };

    useEffect(() => {
        if (activeTab === 'reviews' && walletAddress) {
            fetchMyReviews();
        }
    }, [activeTab, walletAddress]);

    const fetchMyLeads = async () => {
        if (!walletAddress) return;
        setLeadsLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || '/api';
            const res = await fetch(`${API_URL}/users/${walletAddress}/leads`);
            if (res.ok) {
                const data = await res.json();
                setLeads(data);
            }
        } catch (e) {
            console.error('Failed to load leads:', e);
        } finally {
            setLeadsLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'leads' && walletAddress) {
            fetchMyLeads();
        }
    }, [activeTab, walletAddress]);

    /* close avatar picker on outside click */
    useEffect(() => {
        const handler = (e) => { if (avatarRef.current && !avatarRef.current.contains(e.target)) setShowAvatarPicker(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleCopy = () => {
        if (walletAddress) { navigator.clipboard.writeText(walletAddress); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    };
    const handleDisconnect = () => { disconnectWallet(); navigate('/'); };

    const handleSave = async () => {
        try {
            await updateDbUser(walletAddress, draft);
            setProfile(draft);
            setEditing(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error('Failed to save profile to database:', err);
        }
    };
    const handleCancel = () => { setDraft(profile); setEditing(false); setShowAvatarPicker(false); };
    const setDraftField = (k, v) => setDraft(d => ({ ...d, [k]: v }));

    const connectedDate = connectedAt
        ? new Date(connectedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        : 'Today';
    const connectedTime = connectedAt
        ? new Date(connectedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : '--:--';

    const activities = [
        { icon: Shield, color: 'text-blue-600', bg: 'bg-blue-100', title: 'Wallet Connected', desc: `${walletType || 'MetaMask'} — ${getTruncatedAddress()}`, time: connectedTime },
        { icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-100', title: 'Review submitted', desc: 'You rated Binance ★★★★★', time: '2h ago' },
        { icon: Bookmark, color: 'text-purple-600', bg: 'bg-purple-100', title: 'Bookmark added', desc: 'Uniswap saved to bookmarks', time: '1d ago' },
        { icon: Eye, color: 'text-green-600', bg: 'bg-green-100', title: 'Site visited', desc: 'Viewed Coinbase exchange details', time: '2d ago' },
        { icon: MessageSquare, color: 'text-pink-600', bg: 'bg-pink-100', title: 'Review liked', desc: 'Your review got 12 likes', time: '3d ago' },
    ];

    if (!isConnected) return null;

    const displayName = profile.displayName || `Crypto Explorer`;

    return (
        <PageLayout>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 pt-24 pb-16">
                <div className="container-custom">

                    {/* ── Page Header ── */}
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-1.5">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs font-bold text-green-600 uppercase tracking-widest">Wallet Active</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-black text-gray-900">My Dashboard</h1>
                            <p className="text-gray-500 mt-1 text-sm">Welcome back, <span className="font-semibold text-primary">{displayName}</span> 👋</p>
                        </div>

                        {/* Wallet pill */}
                        <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100 flex-shrink-0">
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${profile.avatarBg} flex items-center justify-center text-base`}>
                                {profile.avatarEmoji}
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{walletType || 'MetaMask'}</p>
                                <p className="font-mono text-sm font-bold text-gray-800">{getTruncatedAddress()}</p>
                            </div>
                            <div className="flex items-center gap-1.5 ml-2 pl-3 border-l border-gray-100">
                                <button onClick={handleCopy} title="Copy" className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-blue-100 flex items-center justify-center transition-colors">
                                    {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
                                </button>
                                <button onClick={handleDisconnect} title="Disconnect" className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-red-100 flex items-center justify-center transition-colors">
                                    <LogOut className="w-3.5 h-3.5 text-gray-500" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── Tabs ── */}
                    <div className="flex items-center gap-1 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 mb-8 max-w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex-shrink-0 ${
                                    activeTab === tab.id
                                        ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-md'
                                        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                                }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* ══════════════════ PROJECTS TAB ══════════════════ */}
                    {activeTab === 'projects' && (
                        <div className="space-y-6">

                            {/* Success flash */}
                            {projectSaved && (
                                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-5 py-4 animate-fade-in">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                                    <p className="text-green-700 font-semibold text-sm">Project {editingProject ? 'updated' : 'added'} successfully!</p>
                                </div>
                            )}

                            {/* Subscription Notice Banner */}
                            {!activePlan && (
                                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm animate-fade-in">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 flex-shrink-0">
                                            <CreditCard className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-base">Subscription Required</h4>
                                            <p className="text-sm text-gray-600 mt-1 max-w-xl">
                                                You do not have an active subscription plan. Please activate a subscription to start submitting and showcasing your blockchain or crypto projects.
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setActiveTab('subscription')}
                                        className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all text-sm whitespace-nowrap flex-shrink-0"
                                    >
                                        Activate Subscription 💎
                                    </button>
                                </div>
                            )}

                            {/* ── Header ── */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                        <Folder className="w-5 h-5 text-indigo-500" /> My Projects
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-0.5">Manage and showcase your crypto &amp; blockchain projects</p>
                                </div>
                                <button
                                    onClick={openAddProject}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl shadow-md hover:shadow-xl hover:scale-[1.02] transition-all text-sm"
                                >
                                    <Plus className="w-4 h-4" /> Add New Project
                                </button>
                            </div>

                            {/* ── Stats bar ── */}
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                {[{ label: 'Total', id: 'all' }, ...PROJECT_STATUSES].map(s => {
                                    const count = s.id === 'all'
                                        ? projects.length
                                        : projects.filter(p => p.status === s.id).length;
                                    const meta = PROJECT_STATUSES.find(x => x.id === s.id);
                                    return (
                                        <button
                                            key={s.id}
                                            onClick={() => setProjectFilter(s.id)}
                                            className={`rounded-2xl p-4 text-left border transition-all shadow-sm hover:shadow-md ${
                                                projectFilter === s.id
                                                    ? 'ring-2 ring-indigo-400 border-indigo-200 bg-indigo-50'
                                                    : 'bg-white border-gray-100'
                                            }`}
                                        >
                                            <p className={`text-2xl font-black ${meta ? meta.color : 'text-gray-900'}`}>{count}</p>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">{s.label}</p>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* ── Project Cards Grid ── */}
                            {(() => {
                                const filtered = projectFilter === 'all'
                                    ? projects
                                    : projects.filter(p => p.status === projectFilter);

                                if (filtered.length === 0) return (
                                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                        <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                                            <Rocket className="w-10 h-10 text-indigo-300" />
                                        </div>
                                        <p className="text-gray-700 font-bold text-lg mb-1">
                                            {projectFilter === 'all' ? 'No projects yet' : `No ${PROJECT_STATUSES.find(s=>s.id===projectFilter)?.label} projects`}
                                        </p>
                                        <p className="text-gray-400 text-sm mb-5">Start by adding your first crypto or blockchain project</p>
                                        <button
                                            onClick={openAddProject}
                                            className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-all text-sm"
                                        >
                                            + Add First Project
                                        </button>
                                    </div>
                                );

                                return (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                        {filtered.map(proj => {
                                            const statusMeta = PROJECT_STATUSES.find(s => s.id === proj.status) || PROJECT_STATUSES[0];
                                            const dateStr = new Date(proj.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                            return (
                                                <div key={proj.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group flex flex-col">
                                                    {/* Gradient banner */}
                                                    <div className={`h-20 bg-gradient-to-br ${proj.gradient || 'from-indigo-500 to-purple-600'} relative flex-shrink-0`}>
                                                        <div className="absolute inset-0 opacity-20" style={{
                                                            backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)`,
                                                            backgroundSize: '24px 24px'
                                                        }} />
                                                        {/* Action buttons */}
                                                        <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => openEditProject(proj)}
                                                                className="w-7 h-7 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white transition-colors shadow"
                                                                title="Edit"
                                                            >
                                                                <PenLine className="w-3.5 h-3.5 text-gray-700" />
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteConfirm(proj.id)}
                                                                className="w-7 h-7 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors shadow"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                                            </button>
                                                        </div>
                                                        {/* Category badge */}
                                                        {proj.category && (
                                                            <div className="absolute bottom-3 left-4">
                                                                <span className="text-[10px] font-bold bg-white/25 backdrop-blur-sm text-white px-2.5 py-1 rounded-full border border-white/30">
                                                                    {proj.category}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="p-5 flex flex-col flex-1">
                                                        {/* Name + status */}
                                                        <div className="flex items-start justify-between gap-2 mb-2">
                                                            <h3 className="font-black text-gray-900 text-base leading-tight">{proj.name}</h3>
                                                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ${statusMeta.bg} ${statusMeta.color} ${statusMeta.border}`}>
                                                                <span className={`inline-block w-1.5 h-1.5 rounded-full ${statusMeta.dot} mr-1 align-middle`} />
                                                                {statusMeta.label}
                                                            </span>
                                                        </div>

                                                        {/* Description */}
                                                        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 mb-4 flex-1">{proj.description}</p>

                                                        {/* Tags */}
                                                        {proj.tags && proj.tags.length > 0 && (
                                                            <div className="flex flex-wrap gap-1.5 mb-4">
                                                                {proj.tags.slice(0, 4).map(tag => (
                                                                    <span key={tag} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold">#{tag}</span>
                                                                ))}
                                                                {proj.tags.length > 4 && (
                                                                    <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">+{proj.tags.length - 4}</span>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Links row */}
                                                        <div className="flex items-center gap-2 pt-3 border-t border-gray-100 mt-auto">
                                                            {proj.url && (
                                                                <a href={proj.url.startsWith('http') ? proj.url : `https://${proj.url}`}
                                                                    target="_blank" rel="noopener noreferrer"
                                                                    className="flex items-center gap-1.5 text-xs text-primary bg-blue-50 px-2.5 py-1.5 rounded-lg hover:bg-blue-100 transition-colors font-semibold">
                                                                    <Globe className="w-3 h-3" /> Live Site
                                                                </a>
                                                            )}
                                                            {proj.githubUrl && (
                                                                <a href={proj.githubUrl.startsWith('http') ? proj.githubUrl : `https://github.com/${proj.githubUrl}`}
                                                                    target="_blank" rel="noopener noreferrer"
                                                                    className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-100 px-2.5 py-1.5 rounded-lg hover:bg-gray-200 transition-colors font-semibold">
                                                                    <GitBranch className="w-3 h-3" /> GitHub
                                                                </a>
                                                            )}
                                                            <span className="ml-auto text-[10px] text-gray-400 flex items-center gap-3">
                                                                <span className="flex items-center gap-1 text-blue-500 font-semibold" title="Total page views">
                                                                    <Eye className="w-3.5 h-3.5" />
                                                                    {getDeterministicViews(proj.name)}
                                                                </span>
                                                                <span className="flex items-center gap-1 text-emerald-600 font-semibold" title="Leads captured">
                                                                    <UserCheck className="w-3.5 h-3.5" />
                                                                    {leads.filter(l => l.websiteSlug === (proj.slug || proj.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-')) || l.websiteName?.toLowerCase() === proj.name?.toLowerCase()).length}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="w-3 h-3" /> {dateStr}
                                                                </span>
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Delete confirm inline */}
                                                    {deleteConfirm === proj.id && (
                                                        <div className="px-5 pb-4 animate-fade-in">
                                                            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-3">
                                                                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                                                                <p className="text-xs text-red-700 font-semibold flex-1">Delete "{proj.name}"?</p>
                                                                <button onClick={() => handleDeleteProject(proj.id)}
                                                                    className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors">Yes</button>
                                                                <button onClick={() => setDeleteConfirm(null)}
                                                                    className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors">No</button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })()}

                        </div>
                    )}

                    {/* ── Subscription Required Modal ── */}
                    {showSubRequiredModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            {/* backdrop */}
                            <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={() => setShowSubRequiredModal(false)} />

                            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in border border-gray-100">
                                {/* Modal header */}
                                <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-6 text-center text-white relative">
                                    <button 
                                        onClick={() => setShowSubRequiredModal(false)} 
                                        className="absolute right-4 top-4 w-7 h-7 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                                    >
                                        <X className="w-4 h-4 text-white" />
                                    </button>
                                    <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-3 border border-white/25 shadow-inner">
                                        <CreditCard className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="font-black text-xl">Subscription Required 💎</h3>
                                    <p className="text-white/80 text-xs mt-1">Unlock all premium developer features</p>
                                </div>

                                <div className="p-6 space-y-4">
                                    <p className="text-sm text-gray-600 text-center font-medium leading-relaxed">
                                        To add and showcase your crypto or blockchain projects, you need an active subscription plan.
                                    </p>

                                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                                        <div className="flex items-center gap-2.5 text-xs text-slate-700 font-bold">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                            Showcase unlimited projects
                                        </div>
                                        <div className="flex items-center gap-2.5 text-xs text-slate-700 font-bold">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                            Access advanced developer stats
                                        </div>
                                        <div className="flex items-center gap-2.5 text-xs text-slate-700 font-bold">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                            Boost listing priority in search index
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <button
                                            onClick={() => setShowSubRequiredModal(false)}
                                            className="py-3 border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-all text-center"
                                        >
                                            Maybe Later
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowSubRequiredModal(false);
                                                setActiveTab('subscription');
                                            }}
                                            className="py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all text-center"
                                        >
                                            View Plans 🚀
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Add/Edit Project Modal ── */}
                    {showProjectModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            {/* backdrop */}
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeProjectModal} />

                            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto animate-fade-in">
                                {/* Modal header */}
                                <div className={`sticky top-0 z-10 bg-gradient-to-r ${projectForm.gradient || 'from-indigo-500 to-purple-600'} px-6 py-5 flex items-center justify-between rounded-t-3xl`}>
                                    <div className="flex items-center gap-3 text-white">
                                        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                                            <Folder className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-base">{editingProject ? 'Edit Project' : 'Add New Project'}</h3>
                                            <p className="text-white/70 text-xs">Fill in your project details below</p>
                                        </div>
                                    </div>
                                    <button onClick={closeProjectModal} className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors">
                                        <X className="w-4 h-4 text-white" />
                                    </button>
                                </div>

                                <div className="p-6 space-y-5">
                                    {/* Project Name */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Project Name <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <Rocket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                value={projectForm.name}
                                                onChange={e => setProjectField('name', e.target.value)}
                                                placeholder="e.g. CryptoSwap Protocol"
                                                maxLength={60}
                                                className={`w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/30 transition-all ${projectErrors.name ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                                            />
                                        </div>
                                        {projectErrors.name && <p className="text-xs text-red-600 mt-1">{projectErrors.name}</p>}
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Description <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <textarea
                                                value={projectForm.description}
                                                onChange={e => setProjectField('description', e.target.value)}
                                                placeholder="Describe your project (min 20 chars)…"
                                                rows={3}
                                                maxLength={500}
                                                className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/30 transition-all resize-none ${projectErrors.description ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                                            />
                                            <span className="absolute bottom-2 right-3 text-[10px] text-gray-400">{projectForm.description.length}/500</span>
                                        </div>
                                        {projectErrors.description && <p className="text-xs text-red-600 mt-1">{projectErrors.description}</p>}
                                    </div>

                                    {/* Category + Status */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Category <span className="text-red-500">*</span></label>
                                            <select
                                                value={projectForm.category}
                                                onChange={e => setProjectField('category', e.target.value)}
                                                className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/30 bg-white transition-all ${projectErrors.category ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                                            >
                                                <option value="">Select category…</option>
                                                {PROJECT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                            {projectErrors.category && <p className="text-xs text-red-600 mt-1">{projectErrors.category}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Status <span className="text-red-500">*</span></label>
                                            <select
                                                value={projectForm.status}
                                                onChange={e => setProjectField('status', e.target.value)}
                                                className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/30 bg-white transition-all ${projectErrors.status ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                                            >
                                                {PROJECT_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                            </select>
                                            {projectErrors.status && <p className="text-xs text-red-600 mt-1">{projectErrors.status}</p>}
                                        </div>
                                    </div>

                                    {/* URLs */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Live URL <span className="text-gray-400">(optional)</span></label>
                                            <div className="relative">
                                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    value={projectForm.url}
                                                    onChange={e => setProjectField('url', e.target.value)}
                                                    placeholder="https://yourproject.io"
                                                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/30 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">GitHub <span className="text-gray-400">(optional)</span></label>
                                            <div className="relative">
                                                <GitBranch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    value={projectForm.githubUrl}
                                                    onChange={e => setProjectField('githubUrl', e.target.value)}
                                                    placeholder="username/repo or full URL"
                                                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/30 transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Tags <span className="text-gray-400">(comma-separated, optional)</span></label>
                                        <div className="relative">
                                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                value={projectForm.tags}
                                                onChange={e => setProjectField('tags', e.target.value)}
                                                placeholder="e.g. solidity, defi, audited, layer2"
                                                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/30 transition-all"
                                            />
                                        </div>
                                        {projectForm.tags && (
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                {projectForm.tags.split(',').map(t => t.trim()).filter(Boolean).map(t => (
                                                    <span key={t} className="text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-200 px-2 py-0.5 rounded-full font-semibold">#{t}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Color */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Card Color</label>
                                        <div className="grid grid-cols-8 gap-2">
                                            {GRADIENTS.map(g => (
                                                <button
                                                    key={g}
                                                    type="button"
                                                    onClick={() => setProjectField('gradient', g)}
                                                    className={`h-9 rounded-xl bg-gradient-to-br ${g} transition-all ${projectForm.gradient === g ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : 'hover:scale-105'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                                        <button
                                            type="button"
                                            onClick={handleProjectSave}
                                            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-[1.01] transition-all text-sm"
                                        >
                                            <Save className="w-4 h-4" />
                                            {editingProject ? 'Save Changes' : 'Add Project'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={closeProjectModal}
                                            className="px-5 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ══════════════════ SUBSCRIPTION TAB ══════════════════ */}
                    {activeTab === 'subscription' && (
                        <div className="space-y-8">

                            {/* Success Banner */}
                            {subSuccess && (
                                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-5 py-4 animate-fade-in">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                                    <div>
                                        <p className="text-green-700 font-bold text-sm">Subscription activated! 🎉</p>
                                        <p className="text-green-600 text-xs mt-0.5">Your plan is now active. Enjoy your new features.</p>
                                    </div>
                                </div>
                            )}

                            {/* Header */}
                            <div className="text-center pt-2">
                                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-100 to-purple-100 border border-purple-200 text-purple-700 text-xs font-bold px-4 py-2 rounded-full mb-4">
                                    <Sparkles className="w-3.5 h-3.5" /> Choose Your Plan
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 mb-3">Unlock Full Potential</h2>
                                <p className="text-gray-500 text-sm max-w-lg mx-auto">
                                    Supercharge your crypto journey with exclusive features, priority support, and community recognition.
                                </p>
                            </div>

                            {/* Current Plan Banner */}
                            {activePlan && (() => {
                                const plan = PLANS.find(p => p.id === activePlan.planId);
                                if (!plan) return null;
                                return (
                                    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${plan.gradient} p-5 text-white shadow-lg`}>
                                        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
                                        <div className="flex items-center justify-between relative z-10">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                                    <plan.icon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Active Plan</p>
                                                    <p className="font-black text-lg">{plan.name} — ${plan.price}<span className="text-white/70 text-xs font-normal ml-1">(One-Time Payment)</span></p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-white/60 text-[10px] font-bold uppercase">Activated</p>
                                                <p className="text-sm font-bold">{new Date(activePlan.subscribedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Pricing Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {PLANS.map((plan) => {
                                    const isActive = activePlan?.planId === plan.id;
                                    const IconComp = plan.icon;
                                    return (
                                        <div
                                            key={plan.id}
                                            className={`relative rounded-3xl overflow-hidden flex flex-col transition-all duration-300 ${
                                                plan.badge === 'Most Popular'
                                                    ? 'ring-2 ring-violet-500 shadow-2xl shadow-purple-200 scale-[1.02]'
                                                    : 'border border-gray-100 shadow-md hover:shadow-xl hover:-translate-y-1'
                                            }`}
                                        >
                                            {/* Popular / Best badge */}
                                            {plan.badge && (
                                                <div className="absolute top-4 right-4 z-10">
                                                    <span className={`text-[10px] font-black px-3 py-1.5 rounded-full text-white bg-gradient-to-r ${
                                                        plan.badge === 'Most Popular' ? 'from-violet-500 to-purple-600' : 'from-amber-500 to-orange-500'
                                                    }`}>
                                                        {plan.badge}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Card Header */}
                                            <div className={`bg-gradient-to-br ${plan.gradient} p-6 pb-8 text-white relative overflow-hidden`}>
                                                <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-white/10 rounded-full" />
                                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                                                    <IconComp className="w-6 h-6" />
                                                </div>
                                                <p className="font-black text-xl">{plan.name}</p>
                                                <p className="text-white/70 text-xs mt-0.5 mb-4">{plan.tagline}</p>
                                                <div className="flex flex-col mt-3">
                                                    <span className="text-4xl font-black">${plan.price}</span>
                                                    <span className="text-white/80 text-[10px] font-bold uppercase tracking-wider mt-1">One-Time Payment</span>
                                                </div>
                                            </div>

                                            {/* Features */}
                                            <div className="bg-white flex-1 p-6">
                                                <ul className="space-y-3 mb-6">
                                                    {plan.features.map((f, i) => (
                                                        <li key={i} className={`flex items-center gap-3 text-sm ${
                                                            f.included ? 'text-gray-800' : 'text-gray-300'
                                                        }`}>
                                                            {f.included
                                                                ? <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                                                : <X className="w-4 h-4 text-gray-300 flex-shrink-0" />}
                                                            <span className={f.included ? 'font-medium' : 'line-through'}>{f.text}</span>
                                                        </li>
                                                    ))}
                                                </ul>

                                                {/* CTA */}
                                                {isActive ? (
                                                    <div className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-green-50 border border-green-200 text-green-700 font-bold text-sm">
                                                        <BadgeCheck className="w-4 h-4" /> Current Plan
                                                    </div>
                                                ) : subConfirm === plan.id ? (
                                                    <div className="space-y-3">
                                                        {paymentSubmitted ? (
                                                            /* ── Success state ── */
                                                            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center space-y-2">
                                                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                                </div>
                                                                <p className="text-sm font-bold text-green-800">Payment Submitted!</p>
                                                                <p className="text-xs text-green-700 leading-relaxed">Your payment is under admin review. Your plan will be activated within <strong>1–6 hours</strong> after verification.</p>
                                                                <button
                                                                    onClick={() => { setSubConfirm(null); setPaymentSubmitted(false); setTxHash(''); setPaymentError(''); }}
                                                                    className="mt-1 text-xs text-green-700 underline font-semibold"
                                                                >
                                                                    Close
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                {/* Coupon Code Section */}
                                                                {plan.id === 'starter' && (
                                                                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-left space-y-3 mb-3">
                                                                        <p className="text-xs text-gray-700 font-bold">Promo Coupon Code</p>
                                                                        <div className="flex gap-2">
                                                                            <input
                                                                                type="text"
                                                                                value={couponInput}
                                                                                onChange={e => { setCouponInput(e.target.value); setCouponError(''); }}
                                                                                placeholder="Enter code (e.g. CST50)"
                                                                                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white placeholder:text-gray-300"
                                                                                disabled={couponApplied}
                                                                            />
                                                                            {couponApplied ? (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => { setCouponApplied(false); setCouponInput(''); setDiscountedPrice(null); setPaymentError(''); }}
                                                                                    className="px-3 py-2 bg-red-100 text-red-700 rounded-xl text-xs font-bold hover:bg-red-200 transition-colors"
                                                                                >
                                                                                    Remove
                                                                                </button>
                                                                            ) : (
                                                                                <button
                                                                                    type="button"
                                                                                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors"
                                                                                    onClick={() => {
                                                                                        if (couponInput.trim().toUpperCase() === 'CST50') {
                                                                                            setCouponApplied(true);
                                                                                            setDiscountedPrice(0);
                                                                                            setCouponError('');
                                                                                        } else {
                                                                                            setCouponError('Invalid coupon code.');
                                                                                        }
                                                                                    }}
                                                                                >
                                                                                    Apply
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                        {couponError && <p className="text-[10px] text-red-600 font-semibold">{couponError}</p>}
                                                                        {couponApplied && <p className="text-[10px] text-green-600 font-semibold">✓ Coupon applied: 100% OFF (Starter Free)</p>}
                                                                    </div>
                                                                )}

                                                                {couponApplied && discountedPrice === 0 ? (
                                                                    /* Free Listing Promotion */
                                                                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-left space-y-2 mb-3 animate-fade-in">
                                                                        <p className="text-xs text-emerald-800 font-bold">1. Free Listing Promotion</p>
                                                                        <p className="text-xs text-emerald-700 leading-relaxed">
                                                                            You are claiming a free Starter plan listing using coupon code <strong>CST50</strong> (limited to first 50 projects). No payment needed.
                                                                        </p>
                                                                    </div>
                                                                ) : (
                                                                    /* Paid Checkout Steps */
                                                                    <>
                                                                        {/* Step 1 – Network tabs */}
                                                                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-left space-y-3">
                                                                            <p className="text-xs text-gray-700 font-bold">1. Select network & send <span className="text-indigo-600">${plan.price}</span> (USDT/USDC/ETH/TRX):</p>

                                                                            {/* Network Toggle */}
                                                                            <div className="flex bg-white border border-gray-200 rounded-lg p-0.5 gap-0.5">
                                                                                {['ERC20', 'TRC20'].map(net => (
                                                                                    <button
                                                                                        key={net}
                                                                                        type="button"
                                                                                        onClick={() => setSelectedNetwork(net)}
                                                                                        className={`flex-1 py-1.5 rounded-md text-[11px] font-bold transition-all ${
                                                                                            selectedNetwork === net
                                                                                                ? 'bg-indigo-600 text-white shadow-sm'
                                                                                                : 'text-gray-500 hover:text-gray-800'
                                                                                        }`}
                                                                                    >
                                                                                        {net === 'ERC20' ? 'ERC20 / BEP20' : 'TRC20 (Tron)'}
                                                                                    </button>
                                                                                ))}
                                                                            </div>

                                                                            {selectedNetwork === 'ERC20' ? (
                                                                                <div className="flex gap-3 items-start">
                                                                                    {/* QR Code ERC20 */}
                                                                                    <div className="flex-shrink-0 bg-white border border-gray-200 rounded-lg p-1.5">
                                                                                        <img
                                                                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=88x88&data=0x185018c5f26B2cE105e0B80b231178CE5913b621`}
                                                                                            alt="ERC20 QR Code"
                                                                                            className="w-20 h-20"
                                                                                        />
                                                                                    </div>
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">ETH / BSC / Polygon</p>
                                                                                        <p
                                                                                            className="text-[10px] font-mono font-medium text-gray-800 break-all select-all cursor-pointer bg-white border border-gray-200 rounded p-1.5 hover:bg-indigo-50 transition-colors"
                                                                                            title="Click to copy"
                                                                                            onClick={() => { navigator.clipboard.writeText('0x185018c5f26B2cE105e0B80b231178CE5913b621'); alert('Address copied!'); }}
                                                                                        >
                                                                                            0x185018c5f26B2cE105e0B80b231178CE5913b621
                                                                                        </p>
                                                                                        <p className="text-[9px] text-gray-400 mt-1">Tap address to copy</p>
                                                                                    </div>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="flex gap-3 items-start">
                                                                                    {/* QR Code TRC20 */}
                                                                                    <div className="flex-shrink-0 bg-white border border-gray-200 rounded-lg p-1.5">
                                                                                        <img
                                                                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=88x88&data=TTxvENzgpX7yqp4Z2auHTWxVMAEA5GRSsJ`}
                                                                                            alt="TRC20 QR Code"
                                                                                            className="w-20 h-20"
                                                                                        />
                                                                                    </div>
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">TRON Network</p>
                                                                                        <p
                                                                                            className="text-[10px] font-mono font-medium text-gray-800 break-all select-all cursor-pointer bg-white border border-gray-200 rounded p-1.5 hover:bg-indigo-50 transition-colors"
                                                                                            title="Click to copy"
                                                                                            onClick={() => { navigator.clipboard.writeText('TTxvENzgpX7yqp4Z2auHTWxVMAEA5GRSsJ'); alert('Address copied!'); }}
                                                                                        >
                                                                                            TTxvENzgpX7yqp4Z2auHTWxVMAEA5GRSsJ
                                                                                        </p>
                                                                                        <p className="text-[9px] text-gray-400 mt-1">Tap address to copy</p>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        {/* Step 2 – Enter TX hash */}
                                                                        <div className="space-y-1.5 mb-3">
                                                                            <p className="text-xs text-gray-700 font-bold">2. Paste your transaction hash:</p>
                                                                            <input
                                                                                type="text"
                                                                                value={txHash}
                                                                                onChange={e => { setTxHash(e.target.value); setPaymentError(''); }}
                                                                                placeholder="e.g. 0xabc123... or TXabc123..."
                                                                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white placeholder:text-gray-300"
                                                                            />
                                                                        </div>
                                                                    </>
                                                                )}

                                                                {paymentError && (
                                                                    <p className="text-[10px] text-red-600 font-medium mb-3">{paymentError}</p>
                                                                )}

                                                                {/* Submit + Cancel */}
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        disabled={paymentSubmitting}
                                                                        onClick={async () => {
                                                                            if (!couponApplied && !txHash.trim()) {
                                                                                setPaymentError('Please enter your transaction hash.');
                                                                                return;
                                                                            }
                                                                            setPaymentSubmitting(true);
                                                                            setPaymentError('');
                                                                            try {
                                                                                const API_URL = import.meta.env.VITE_API_URL || '/api';
                                                                                const payload = couponApplied ? {
                                                                                    planId: plan.id,
                                                                                    planPrice: 0,
                                                                                    couponCode: 'CST50',
                                                                                    network: 'COUPON',
                                                                                    txHash: `COUPON_CST50_${walletAddress.slice(2, 10)}_${Date.now()}`
                                                                                } : {
                                                                                    planId: plan.id,
                                                                                    planPrice: plan.price,
                                                                                    network: selectedNetwork,
                                                                                    txHash: txHash.trim()
                                                                                };

                                                                                const res = await fetch(`${API_URL}/users/${walletAddress}/subscription-payment`, {
                                                                                    method: 'POST',
                                                                                    headers: { 'Content-Type': 'application/json' },
                                                                                    body: JSON.stringify(payload)
                                                                                });
                                                                                const data = await res.json();
                                                                                if (!res.ok) {
                                                                                    setPaymentError(data.message || 'Submission failed. Please try again.');
                                                                                } else {
                                                                                    setPaymentSubmitted(true);
                                                                                    setTxHash('');
                                                                                    if (couponApplied) {
                                                                                        setActivePlan({
                                                                                            planId: plan.id,
                                                                                            subscribedAt: Date.now(),
                                                                                            price: 0
                                                                                        });
                                                                                    }
                                                                                }
                                                                            } catch (err) {
                                                                                setPaymentError('Network error. Make sure the server is running.');
                                                                            } finally {
                                                                                setPaymentSubmitting(false);
                                                                            }
                                                                        }}
                                                                        className={`flex-1 py-2.5 rounded-xl bg-gradient-to-r ${plan.gradient} text-white font-bold text-xs hover:shadow-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed`}
                                                                    >
                                                                        {paymentSubmitting ? (
                                                                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                                        ) : couponApplied ? (
                                                                            '🎁 Claim Free Listing'
                                                                        ) : (
                                                                            '✅ Submit for Approval'
                                                                        )}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            setSubConfirm(null);
                                                                            setTxHash('');
                                                                            setCouponInput('');
                                                                            setCouponApplied(false);
                                                                            setDiscountedPrice(null);
                                                                            setPaymentError('');
                                                                            setPaymentSubmitted(false);
                                                                        }}
                                                                        className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-xs hover:bg-gray-200 transition-all"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setSubConfirm(plan.id)}
                                                        className={`w-full py-3 rounded-2xl bg-gradient-to-r ${plan.gradient} text-white font-bold text-sm hover:shadow-lg hover:scale-[1.01] transition-all`}
                                                    >
                                                        {activePlan ? 'Switch to ' + plan.name : 'Get Started'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Feature Comparison Note */}
                            <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 border border-blue-100">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                                    {[
                                        { icon: Shield, label: 'Secure Billing',   desc: 'Encrypted payments, no card stored on-chain', color: 'text-blue-600', bg: 'bg-blue-100' },
                                        { icon: RefreshCw, label: 'Cancel Anytime', desc: 'No lock-in. Downgrade or cancel at any time',   color: 'text-purple-600', bg: 'bg-purple-100' },
                                        { icon: Zap, label: 'Instant Access',      desc: 'Features activate the moment you subscribe',    color: 'text-amber-600',  bg: 'bg-amber-100'  },
                                    ].map(({ icon: Icon, label, desc, color, bg }) => (
                                        <div key={label} className="flex flex-col items-center gap-2">
                                            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
                                                <Icon className={`w-5 h-5 ${color}`} />
                                            </div>
                                            <p className="font-bold text-gray-900 text-sm">{label}</p>
                                            <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Billing History */}
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-indigo-500" /> Billing History
                                </h3>
                                {activePlan ? (() => {
                                    const plan = PLANS.find(p => p.id === activePlan.planId);
                                    const subDate = new Date(activePlan.subscribedAt);
                                    const nextDate = new Date(subDate);
                                    nextDate.setMonth(nextDate.getMonth() + 1);
                                    return (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b border-gray-100">
                                                        {['Date', 'Plan', 'Amount', 'Status'].map(h => (
                                                            <th key={h} className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider pb-3 pr-4">{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr className="border-b border-gray-50">
                                                        <td className="py-3 pr-4 text-gray-700 font-medium">{subDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                                        <td className="py-3 pr-4">
                                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full text-white bg-gradient-to-r ${plan?.gradient}`}>{plan?.name}</span>
                                                        </td>
                                                        <td className="py-3 pr-4 font-bold text-gray-900">${activePlan.price}.00</td>
                                                        <td className="py-3">
                                                            <span className="text-xs font-bold text-green-700 bg-green-100 border border-green-200 px-2.5 py-1 rounded-full">✓ Paid</span>
                                                        </td>
                                                    </tr>
                                                    <tr className="opacity-40">
                                                        <td className="py-3 pr-4 text-gray-700 font-medium">{nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                                        <td className="py-3 pr-4">
                                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full text-white bg-gradient-to-r ${plan?.gradient}`}>{plan?.name}</span>
                                                        </td>
                                                        <td className="py-3 pr-4 font-bold text-gray-900">${activePlan.price}.00</td>
                                                        <td className="py-3">
                                                            <span className="text-xs font-bold text-blue-700 bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-full">⏳ Upcoming</span>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                                <p className="text-xs text-gray-500">Next billing: <span className="font-bold text-gray-800">{nextDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span></p>
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            await updateDbUserSubscription(walletAddress, null);
                                                            saveSubscription(walletAddress, null);
                                                            setActivePlan(null);
                                                        } catch (err) {
                                                            console.error('Failed to cancel subscription:', err);
                                                        }
                                                    }}
                                                    className="text-xs text-red-500 hover:text-red-700 font-semibold hover:underline transition-colors"
                                                >
                                                    Cancel Subscription
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })() : (
                                    <div className="text-center py-10">
                                        <CreditCard className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                        <p className="text-gray-400 text-sm">No billing history yet</p>
                                        <p className="text-gray-300 text-xs mt-1">Subscribe to a plan to see your invoices here</p>
                                    </div>
                                )}
                            </div>

                            {/* FAQ */}
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                <h3 className="font-bold text-gray-900 text-base mb-5 flex items-center gap-2">
                                    <Info className="w-4 h-4 text-blue-500" /> Frequently Asked Questions
                                </h3>
                                <div className="space-y-2">
                                    {FAQ.map((item, i) => (
                                        <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                                            <button
                                                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                                            >
                                                <span className="text-sm font-semibold text-gray-800">{item.q}</span>
                                                <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 ml-3 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
                                            </button>
                                            {openFaq === i && (
                                                <div className="px-5 pb-4 animate-fade-in">
                                                    <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    )}

                    {/* ══════════════════ REVIEWS TAB ══════════════════ */}
                    {activeTab === 'reviews' && (
                        <div className="space-y-6 animate-fade-in">
                            {/* Header row */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" /> Reviews Given
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-0.5">Manage and track reviews you've written for other platforms</p>
                                </div>
                                <button onClick={fetchMyReviews} className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors" title="Refresh">
                                    <RefreshCw className={`w-4 h-4 text-gray-500 ${reviewsLoading ? 'animate-spin' : ''}`} />
                                </button>
                            </div>

                            {/* Main area */}
                            {reviewsLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[1, 2].map(n => (
                                        <div key={n} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm animate-pulse space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-200 rounded-xl" />
                                                <div className="space-y-2 flex-1">
                                                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                                                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                                                </div>
                                            </div>
                                            <div className="h-4 bg-gray-200 rounded w-1/4" />
                                            <div className="h-16 bg-gray-200 rounded" />
                                        </div>
                                    ))}
                                </div>
                            ) : reviewsError ? (
                                <div className="text-center py-10 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                    <p className="text-red-500 font-semibold mb-2">{reviewsError}</p>
                                    <button onClick={fetchMyReviews} className="px-4 py-2 bg-primary text-white font-bold rounded-xl shadow-sm hover:scale-[1.02] transition-transform text-sm">
                                        Retry
                                    </button>
                                </div>
                            ) : myReviews.length === 0 ? (
                                <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-4">
                                    <div className="w-16 h-16 bg-yellow-50 rounded-2xl flex items-center justify-center mx-auto text-yellow-500">
                                        <Star className="w-8 h-8" />
                                    </div>
                                    <div className="max-w-md mx-auto">
                                        <h3 className="text-lg font-bold text-gray-900">No reviews given yet</h3>
                                        <p className="text-sm text-gray-500 mt-1">Share your experience with the Web3 community by rating and reviewing platforms you've used.</p>
                                    </div>
                                    <button onClick={() => navigate('/browse')} className="px-5 py-2.5 bg-gradient-to-r from-primary to-blue-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all text-sm">
                                        Browse Platforms to Review
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {myReviews.map(rev => {
                                        const siteSlug = rev.websiteId;
                                        const siteName = rev.websiteName || siteSlug;
                                        const domain = rev.websiteUrl ? rev.websiteUrl.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0] : '';
                                        const logoUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : `https://ui-avatars.com/api/?name=${encodeURIComponent(siteName)}&size=96&background=0D6EFD&color=fff&bold=true`;
                                        const starCount = Math.round(rev.rating / 20);

                                        return (
                                            <div key={rev._id || rev.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative group">
                                                <div>
                                                    {/* Website Info Header */}
                                                    <div className="flex items-center justify-between gap-3 mb-4">
                                                        <Link to={`/websites/${siteSlug}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                                                            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                                <img src={logoUrl} alt={siteName} className="w-6 h-6 object-contain" onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(siteName)}&size=96&background=0D6EFD&color=fff&bold=true`; }} />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-bold text-gray-800 text-sm hover:text-primary transition-colors line-clamp-1">{siteName}</h3>
                                                                <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full capitalize">{rev.websiteCategory || 'Platform'}</span>
                                                            </div>
                                                        </Link>
                                                        
                                                        {/* Action: Delete */}
                                                        <button 
                                                            onClick={() => handleDeleteReview(rev._id || rev.id)}
                                                            className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                                            title="Delete Review"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    {/* Rating */}
                                                    <div className="flex items-center gap-1 mb-2">
                                                        {[1, 2, 3, 4, 5].map((s) => (
                                                            <Star 
                                                                key={s} 
                                                                className={`w-3.5 h-3.5 ${s <= starCount ? 'text-yellow-500 fill-yellow-500' : 'text-gray-200'}`} 
                                                            />
                                                        ))}
                                                        <span className="text-xs text-gray-400 ml-1.5 font-bold">({rev.rating}/100)</span>
                                                    </div>

                                                    {/* Review Title & Text */}
                                                    {rev.title && <h4 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">“{rev.title}”</h4>}
                                                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-3 mb-3">{rev.text}</p>
                                                </div>

                                                {/* Card Footer */}
                                                <div className="flex items-center justify-between border-t border-gray-50 pt-3 mt-auto">
                                                    <span className="text-[10px] text-gray-400 flex items-center gap-1 font-semibold">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(rev.timestamp || rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                    {rev.helpful > 0 && (
                                                        <span className="text-[10px] text-green-600 bg-green-50 font-bold px-2 py-0.5 rounded-full">
                                                            👍 {rev.helpful} helpful
                                                        </span>
                                                    )}
                                                    {rev.screenshotUrl && (
                                                        <a href={rev.screenshotUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-600 hover:underline flex items-center gap-1 font-semibold">
                                                            <Camera className="w-3 h-3" /> View Screenshot
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ══════════════════ SCAM REPORTS TAB ══════════════════ */}
                    {activeTab === 'reports' && (
                        <div className="space-y-6">

                            {/* Success banner */}
                            {submitSuccess && (
                                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-5 py-4 animate-fade-in">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                                    <p className="text-green-700 font-semibold text-sm">Report submitted! Our team will review it shortly.</p>
                                </div>
                            )}

                            {/* Header row */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-red-500" /> Scam Reports
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-0.5">Track reports you've filed and submit new ones</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={fetchMyReports} className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors" title="Refresh">
                                        <RefreshCw className={`w-4 h-4 text-gray-500 ${reportsLoading ? 'animate-spin' : ''}`} />
                                    </button>
                                    <button
                                        onClick={() => { setShowReportForm(f => !f); setReportFormErrors({}); }}
                                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all text-sm"
                                    >
                                        <Plus className="w-4 h-4" /> File New Report
                                    </button>
                                </div>
                            </div>

                            {/* ── Stats bar ── */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    { label: 'Total Filed',        value: myReports.length,                                                          color: 'text-gray-900',   bg: 'bg-white',          icon: Flag },
                                    { label: 'Pending',            value: myReports.filter(r => r.status === 'pending').length,                       color: 'text-yellow-700', bg: 'bg-yellow-50',      icon: Clock },
                                    { label: 'Under Review',       value: myReports.filter(r => r.status === 'under_investigation').length,            color: 'text-blue-700',   bg: 'bg-blue-50',        icon: Search },
                                    { label: 'Confirmed / Closed', value: myReports.filter(r => ['confirmed','resolved'].includes(r.status)).length,  color: 'text-green-700',  bg: 'bg-green-50',       icon: CheckCircle2 },
                                ].map(({ label, value, color, bg, icon: Icon }) => (
                                    <div key={label} className={`${bg} border border-gray-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm`}>
                                        <div className={`w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0`}>
                                            <Icon className={`w-4 h-4 ${color}`} />
                                        </div>
                                        <div>
                                            <p className={`text-xl font-black ${color}`}>{value}</p>
                                            <p className="text-[10px] text-gray-500 font-semibold leading-tight">{label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* ── New Report Form ── */}
                            {showReportForm && (
                                <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden animate-fade-in">
                                    <div className="bg-gradient-to-r from-red-500 to-rose-600 px-6 py-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-white">
                                            <Flag className="w-5 h-5" />
                                            <h3 className="font-bold text-base">File a Scam Report</h3>
                                        </div>
                                        <button onClick={() => { setShowReportForm(false); setReportFormErrors({}); }}
                                            className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                                            <X className="w-4 h-4 text-white" />
                                        </button>
                                    </div>

                                    <form onSubmit={handleReportSubmit} className="p-6 space-y-5">
                                        {/* Info note */}
                                        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                                            <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                            <p className="text-xs text-amber-700 leading-relaxed">
                                                Use the <strong>platform slug</strong> (the URL identifier, e.g. <code className="bg-amber-100 px-1 rounded">binance</code> for <em>binance.com</em>).
                                                Your wallet address is attached automatically.
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {/* Platform slug */}
                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Platform Slug <span className="text-red-500">*</span></label>
                                                <div className="relative">
                                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <input
                                                        value={reportForm.websiteId}
                                                        onChange={e => setReportForm(f => ({ ...f, websiteId: e.target.value }))}
                                                        placeholder="e.g. binance"
                                                        className={`w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400/30 transition-all ${reportFormErrors.websiteId ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                                                    />
                                                </div>
                                                {reportFormErrors.websiteId && <p className="text-xs text-red-600 mt-1">{reportFormErrors.websiteId}</p>}
                                            </div>

                                            {/* Scam type */}
                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Scam Type <span className="text-red-500">*</span></label>
                                                <select
                                                    value={reportForm.scamType}
                                                    onChange={e => setReportForm(f => ({ ...f, scamType: e.target.value }))}
                                                    className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400/30 transition-all bg-white ${reportFormErrors.scamType ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                                                >
                                                    <option value="">Select type…</option>
                                                    {SCAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                                </select>
                                                {reportFormErrors.scamType && <p className="text-xs text-red-600 mt-1">{reportFormErrors.scamType}</p>}
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Description <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <textarea
                                                    value={reportForm.description}
                                                    onChange={e => setReportForm(f => ({ ...f, description: e.target.value }))}
                                                    placeholder="Describe what happened in detail (min 30 chars)…"
                                                    rows={4}
                                                    maxLength={1000}
                                                    className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400/30 transition-all resize-none ${reportFormErrors.description ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                                                />
                                                <span className="absolute bottom-2 right-3 text-[10px] text-gray-400">{reportForm.description.length}/1000</span>
                                            </div>
                                            {reportFormErrors.description && <p className="text-xs text-red-600 mt-1">{reportFormErrors.description}</p>}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {/* Scammer Wallet Address */}
                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Scammer Wallet Address <span className="text-gray-400">(optional)</span></label>
                                                <div className="relative">
                                                    <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <input
                                                        value={reportForm.scammerWalletAddress}
                                                        onChange={e => setReportForm(f => ({ ...f, scammerWalletAddress: e.target.value }))}
                                                        placeholder="0x…"
                                                        className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400/30 transition-all font-mono"
                                                    />
                                                </div>
                                            </div>

                                            {/* TX Hash */}
                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Transaction Hash <span className="text-gray-400">(optional)</span></label>
                                                <div className="relative">
                                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <input
                                                        value={reportForm.txHash}
                                                        onChange={e => setReportForm(f => ({ ...f, txHash: e.target.value }))}
                                                        placeholder="0x…"
                                                        className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400/30 transition-all font-mono"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Evidence URL */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Evidence Upload / URL <span className="text-gray-400">(optional)</span></label>
                                            <div className="relative">
                                                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    value={reportForm.evidenceUrl}
                                                    onChange={e => setReportForm(f => ({ ...f, evidenceUrl: e.target.value }))}
                                                    placeholder="Link to screenshot or transaction proof…"
                                                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400/30 transition-all"
                                                />
                                            </div>
                                        </div>

                                        {reportFormErrors.submit && (
                                            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                                                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                                                <p className="text-sm text-red-700 font-medium">{reportFormErrors.submit}</p>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                                            <button type="submit" disabled={submitting}
                                                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-[1.01] transition-all text-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100">
                                                {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                                {submitting ? 'Submitting…' : 'Submit Report'}
                                            </button>
                                            <button type="button" onClick={() => { setShowReportForm(false); setReportFormErrors({}); }}
                                                className="px-5 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all text-sm">
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* ── Filter tabs ── */}
                            <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-gray-100 shadow-sm w-fit flex-wrap">
                                {['all','pending','under_investigation','confirmed','resolved'].map(f => (
                                    <button key={f} onClick={() => setReportFilter(f)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                            reportFilter === f
                                                ? 'bg-gray-900 text-white shadow'
                                                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                                        }`}>
                                        {f === 'all' ? 'All' : STATUS_META[f]?.label}
                                        <span className="ml-1 opacity-60">
                                            ({f === 'all' ? myReports.length : myReports.filter(r => r.status === f).length})
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {/* ── Reports List ── */}
                            {reportsLoading ? (
                                <div className="space-y-3">
                                    {[1,2,3].map(i => <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />)}
                                </div>
                            ) : reportsError ? (
                                <div className="text-center py-12">
                                    <AlertTriangle className="w-10 h-10 text-red-300 mx-auto mb-2" />
                                    <p className="text-gray-500 text-sm">{reportsError}</p>
                                    <button onClick={fetchMyReports} className="mt-2 text-sm text-primary font-semibold hover:underline">Retry</button>
                                </div>
                            ) : (() => {
                                const filtered = reportFilter === 'all' ? myReports : myReports.filter(r => r.status === reportFilter);
                                if (filtered.length === 0) return (
                                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Flag className="w-8 h-8 text-red-200" />
                                        </div>
                                        <p className="text-gray-500 font-semibold">{reportFilter === 'all' ? 'No reports filed yet' : `No ${STATUS_META[reportFilter]?.label} reports`}</p>
                                        <p className="text-gray-400 text-sm mt-1">Spotted a scam? Help protect the community.</p>
                                        <button onClick={() => setShowReportForm(true)}
                                            className="mt-4 px-5 py-2 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 transition-colors">
                                            File Your First Report
                                        </button>
                                    </div>
                                );
                                return (
                                    <div className="space-y-4">
                                        {filtered.map(report => {
                                            const meta = STATUS_META[report.status] || STATUS_META.pending;
                                            const date = new Date(report.createdAt || report.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                            return (
                                                <div key={report._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                                                    {/* Colored left accent */}
                                                    <div className={`flex items-stretch`}>
                                                        <div className={`w-1.5 flex-shrink-0 ${meta.dot} rounded-l-2xl`} />
                                                        <div className="flex-1 p-5">
                                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                                                                <div className="flex items-start gap-3">
                                                                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                                                                        <AlertTriangle className="w-5 h-5 text-red-500" />
                                                                    </div>
                                                                    <div>
                                                                        <div className="flex items-center gap-2 flex-wrap">
                                                                            <p className="font-bold text-gray-900 text-sm">{report.websiteId}</p>
                                                                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${meta.bg} ${meta.color} ${meta.border}`}>
                                                                                <span className={`inline-block w-1.5 h-1.5 rounded-full ${meta.dot} mr-1 align-middle`} />
                                                                                {meta.label}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-xs text-gray-500 mt-0.5">{report.scamType}</p>
                                                                    </div>
                                                                </div>
                                                                <span className="text-xs text-gray-400 font-medium flex-shrink-0 flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" /> {date}
                                                                </span>
                                                            </div>

                                                            <p className="text-sm text-gray-700 leading-relaxed mb-3 line-clamp-2">{report.description}</p>

                                                            <div className="flex flex-wrap gap-3 text-xs">
                                                                {report.scammerWalletAddress && (
                                                                    <div className="flex items-center gap-1.5 text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                                                                        <Wallet className="w-3 h-3 text-gray-400" />
                                                                        <span className="font-mono truncate max-w-[140px]" title={report.scammerWalletAddress}>
                                                                            {report.scammerWalletAddress.slice(0, 6)}...{report.scammerWalletAddress.slice(-4)}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {report.txHash && (
                                                                    <div className="flex items-center gap-1.5 text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                                                                        <Hash className="w-3 h-3 text-gray-400" />
                                                                        <span className="font-mono truncate max-w-[140px]">{report.txHash}</span>
                                                                    </div>
                                                                )}
                                                                {report.evidenceUrl && (
                                                                    <a href={report.evidenceUrl} target="_blank" rel="noopener noreferrer"
                                                                        className="flex items-center gap-1.5 text-primary bg-blue-50 px-2.5 py-1.5 rounded-lg hover:bg-blue-100 transition-colors font-semibold">
                                                                        <ExternalLink className="w-3 h-3" /> View Evidence
                                                                    </a>
                                                                )}
                                                                <Link to={`/website/${report.websiteId}`}
                                                                    className="flex items-center gap-1.5 text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                                                                    <Globe className="w-3 h-3" /> View Platform
                                                                </Link>
                                                            </div>

                                                            {/* Status timeline */}
                                                            <div className="mt-4 pt-3 border-t border-gray-100">
                                                                <div className="flex items-center gap-0">
                                                                    {['pending','under_investigation','confirmed','resolved'].map((s, i, arr) => {
                                                                        const statuses = ['pending','under_investigation','confirmed','resolved'];
                                                                        const currentIdx = statuses.indexOf(report.status);
                                                                        const isDone = statuses.indexOf(s) <= currentIdx;
                                                                        const m = STATUS_META[s];
                                                                        return (
                                                                            <React.Fragment key={s}>
                                                                                <div className="flex flex-col items-center">
                                                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                                                                        isDone ? `${m.dot} border-transparent` : 'bg-white border-gray-200'
                                                                                    }`}>
                                                                                        {isDone && <Check className="w-2.5 h-2.5 text-white" />}
                                                                                    </div>
                                                                                    <span className={`text-[9px] font-bold mt-1 text-center leading-tight w-14 ${
                                                                                        isDone ? m.color : 'text-gray-300'
                                                                                    }`}>{m.label}</span>
                                                                                </div>
                                                                                {i < arr.length - 1 && (
                                                                                    <div className={`flex-1 h-0.5 mb-4 transition-all ${
                                                                                        statuses.indexOf(arr[i+1]) <= currentIdx ? 'bg-gray-400' : 'bg-gray-200'
                                                                                    }`} />
                                                                                )}
                                                                            </React.Fragment>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })()}

                            {/* Tip card */}
                            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-5 border border-red-100">
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                                        <Shield className="w-5 h-5 text-red-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm mb-1">How scam reports help</p>
                                        <p className="text-xs text-gray-600 leading-relaxed">
                                            Every report is reviewed by our moderation team. Confirmed scams are flagged sitewide with a ⚠️ alert, and platforms may be delisted. Providing a transaction hash or screenshot speeds up verification.
                                        </p>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {['Phishing','Rug Pull','Smart Contract Bug','Fake Token'].map(tag => (
                                                <span key={tag} className="text-[10px] bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full font-semibold">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}

                    {/* ══════════════════ LEADS TAB ══════════════════ */}
                    {activeTab === 'leads' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                        <UserCheck className="w-5 h-5 text-indigo-500" /> Buyer Leads Dashboard
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-0.5">Track potential users and buyers who clicked on your projects</p>
                                </div>
                                <button 
                                    onClick={fetchMyLeads}
                                    className="p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all"
                                    title="Refresh leads"
                                >
                                    <RefreshCw className={`w-4 h-4 text-gray-600 ${leadsLoading ? 'animate-spin' : ''}`} />
                                </button>
                            </div>

                            {/* Leads count summary cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="bg-gradient-to-br from-indigo-500 to-indigo-650 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
                                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
                                    <p className="text-white/70 text-xs font-bold uppercase tracking-wider">Total Leads</p>
                                    <p className="text-3xl font-black mt-1">{leads.length}</p>
                                    <p className="text-[10px] text-white/60 mt-2 font-medium">Captured from clicks</p>
                                </div>
                                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Unique Visitors</p>
                                    <p className="text-3xl font-black text-gray-800 mt-1">
                                        {new Set(leads.map(l => l.leadWalletAddress)).size}
                                    </p>
                                    <p className="text-[10px] text-gray-400 mt-2 font-medium">Distinct wallet addresses</p>
                                </div>
                                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Conversion Interest</p>
                                    <p className="text-3xl font-black text-emerald-600 mt-1">
                                        {leads.length > 0 ? 'High 🔥' : '—'}
                                    </p>
                                    <p className="text-[10px] text-gray-400 mt-2 font-medium">Based on active click rates</p>
                                </div>
                            </div>

                            {/* Leads List Table */}
                            <div className="bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                    <h3 className="font-bold text-gray-800 text-sm">All Captured Lead Information</h3>
                                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-bold">
                                        {leads.length} Active Leads
                                    </span>
                                </div>

                                {leadsLoading ? (
                                    <div className="p-12 text-center space-y-3">
                                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                                        <p className="text-xs text-gray-500 font-semibold">Loading your leads...</p>
                                    </div>
                                ) : leads.length === 0 ? (
                                    <div className="text-center py-16 px-6">
                                        <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                                            <UserCheck className="w-8 h-8 text-gray-300" />
                                        </div>
                                        <h4 className="font-bold text-gray-800 mb-1">No Leads Yet</h4>
                                        <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                                            Leads are generated automatically when other logged-in users click on your listed projects. Promote your projects to start collecting interest!
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-gray-100 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                    <th className="py-4 px-6 text-left">Project Name</th>
                                                    <th className="py-4 px-6 text-left">User Details</th>
                                                    <th className="py-4 px-6 text-left">Wallet Address</th>
                                                    <th className="py-4 px-6 text-right">Clicked Date</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {leads.map((lead) => (
                                                    <tr key={lead._id || lead.id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="py-4 px-6 font-bold text-gray-800">
                                                            {lead.websiteName}
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <div className="font-semibold text-gray-700">@{lead.leadUsername || 'anonymous'}</div>
                                                            <div className="text-xs text-gray-400 font-medium">{lead.leadEmail || '—'}</div>
                                                        </td>
                                                        <td className="py-4 px-6 font-mono text-xs text-indigo-600 font-bold select-all cursor-pointer" title="Click to copy" onClick={() => { navigator.clipboard.writeText(lead.leadWalletAddress); alert('Wallet address copied!'); }}>
                                                            {lead.leadWalletAddress.slice(0, 8)}...{lead.leadWalletAddress.slice(-6)}
                                                        </td>
                                                        <td className="py-4 px-6 text-right text-xs text-gray-500 font-semibold">
                                                            {new Date(lead.clickedAt || lead.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ══════════════════ REFERRALS TAB ══════════════════ */}
                    {activeTab === 'referrals' && (() => {
                        const totalRefs = referrals.length;
                        let rank = 'Starter';
                        let commission = '0%';
                        let rankGlow = '';
                        
                        if (totalRefs >= 50) {
                            rank = 'Platinum';
                            commission = '30%';
                            rankGlow = 'ring-2 ring-purple-400 bg-purple-50/50';
                        } else if (totalRefs >= 25) {
                            rank = 'Gold';
                            commission = '25%';
                            rankGlow = 'ring-2 ring-amber-400 bg-amber-50/50';
                        } else if (totalRefs >= 10) {
                            rank = 'Silver';
                            commission = '20%';
                            rankGlow = 'ring-2 ring-slate-400 bg-slate-50/50';
                        } else if (totalRefs >= 1) {
                            rank = 'Bronze';
                            commission = '15%';
                            rankGlow = 'ring-2 ring-amber-500/40 bg-amber-50/30';
                        }

                        const refLink = `${window.location.origin}?ref=${user?.referralCode || walletAddress}`;

                        const copyToClipboard = () => {
                            navigator.clipboard.writeText(refLink);
                            setCopiedLink(true);
                            setTimeout(() => setCopiedLink(false), 2000);
                        };

                        const shareTwitter = () => {
                            const text = encodeURIComponent(`Join Crypto Suggest, showcase your blockchain projects, and get reviewed! 🚀 `);
                            const url = encodeURIComponent(refLink);
                            window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
                        };

                        const shareTelegram = () => {
                            const text = encodeURIComponent(`Join Crypto Suggest and showcase your blockchain projects!`);
                            const url = encodeURIComponent(refLink);
                            window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
                        };

                        const shareWhatsApp = () => {
                            const text = encodeURIComponent(`Join Crypto Suggest and showcase your blockchain projects! ${refLink}`);
                            window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
                        };

                        return (
                            <div className="space-y-6 animate-fade-in">
                                {/* ── Header & Info ── */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                            <Users className="w-5 h-5 text-indigo-500" /> Referral & Partner Program
                                        </h2>
                                        <p className="text-sm text-gray-500 mt-0.5">Invite builders and projects to join and earn commissions</p>
                                    </div>
                                </div>

                                {/* ── Referral Link Copy Card ── */}
                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                    <div className="space-y-2 flex-1 w-full">
                                        <h4 className="font-bold text-gray-900 text-sm">Your Invitation Link</h4>
                                        <p className="text-xs text-gray-500">Share this link to register users under your referral circle and earn commission on their subscriptions.</p>
                                        
                                        <div className="flex items-center gap-2 mt-3 bg-gray-50 border border-gray-200 rounded-2xl p-2 pl-4 w-full max-w-xl">
                                            <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                            <input 
                                                type="text" 
                                                readOnly 
                                                value={refLink} 
                                                className="bg-transparent border-none outline-none text-xs text-gray-700 font-mono flex-1 min-w-0" 
                                            />
                                            <button 
                                                onClick={copyToClipboard}
                                                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow transition-all ${
                                                    copiedLink ? 'bg-green-500' : 'bg-gradient-to-r from-primary to-primary-dark hover:scale-[1.02]'
                                                }`}
                                            >
                                                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                                {copiedLink ? 'Copied!' : 'Copy Link'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Social sharing */}
                                    <div className="flex flex-col gap-2 w-full md:w-auto">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Quick Share</p>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={shareTwitter}
                                                className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-50 text-sky-600 hover:bg-sky-100 border border-sky-200 font-bold rounded-xl text-xs transition-all"
                                            >
                                                <Twitter className="w-3.5 h-3.5 fill-sky-600" /> Twitter
                                            </button>
                                            <button 
                                                onClick={shareTelegram}
                                                className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 font-bold rounded-xl text-xs transition-all"
                                            >
                                                <Send className="w-3.5 h-3.5 animate-pulse" /> Telegram
                                            </button>
                                            <button 
                                                onClick={shareWhatsApp}
                                                className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 font-bold rounded-xl text-xs transition-all"
                                            >
                                                <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* ── Stats grid ── */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                    <StatCard 
                                        icon={Users} 
                                        label="Total Referrals" 
                                        value={totalRefs} 
                                        color="text-indigo-600" 
                                        bg="bg-white" 
                                    />
                                    <StatCard 
                                        icon={Award} 
                                        label="Current Rank" 
                                        value={rank} 
                                        color={rank === 'Starter' ? 'text-gray-500' : rank === 'Bronze' ? 'text-amber-800' : rank === 'Silver' ? 'text-slate-700' : rank === 'Gold' ? 'text-amber-500' : 'text-purple-600'} 
                                        bg="bg-white" 
                                    />
                                    <StatCard 
                                        icon={CreditCard} 
                                        label="Commission Tier" 
                                        value={commission} 
                                        color="text-emerald-600" 
                                        bg="bg-white" 
                                    />
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* ── Partner Ranking System Table ── */}
                                    <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
                                        <div>
                                            <h3 className="font-black text-gray-900 text-base">Partner Ranking System</h3>
                                            <p className="text-xs text-gray-500 mt-0.5">Rank up based on total referrals to unlock higher commission rates.</p>
                                        </div>

                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm border-collapse">
                                                <thead>
                                                    <tr className="border-b border-gray-100 text-gray-400 text-xs font-bold uppercase tracking-wider">
                                                        <th className="py-3 px-4 font-black">Partner Rank</th>
                                                        <th className="py-3 px-4 font-black text-center">Total Referrals</th>
                                                        <th className="py-3 px-4 font-black text-right">Commission</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr className={`border-b border-gray-50 transition-all rounded-2xl ${rank === 'Bronze' ? rankGlow : 'hover:bg-slate-50/50'}`}>
                                                        <td className="py-4 px-4 font-bold text-gray-800 flex items-center gap-2">
                                                            <div className="w-2.5 h-2.5 rounded-full bg-amber-700/60" />
                                                            Bronze
                                                            {rank === 'Bronze' && <span className="text-[10px] bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-bold ml-2">Active</span>}
                                                        </td>
                                                        <td className="py-4 px-4 text-center font-bold text-gray-600">1–9</td>
                                                        <td className="py-4 px-4 text-right font-black text-indigo-600">15%</td>
                                                    </tr>
                                                    <tr className={`border-b border-gray-50 transition-all rounded-2xl ${rank === 'Silver' ? rankGlow : 'hover:bg-slate-50/50'}`}>
                                                        <td className="py-4 px-4 font-bold text-gray-800 flex items-center gap-2">
                                                            <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                                                            Silver
                                                            {rank === 'Silver' && <span className="text-[10px] bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-bold ml-2">Active</span>}
                                                        </td>
                                                        <td className="py-4 px-4 text-center font-bold text-gray-600">10–24</td>
                                                        <td className="py-4 px-4 text-right font-black text-indigo-600">20%</td>
                                                    </tr>
                                                    <tr className={`border-b border-gray-50 transition-all rounded-2xl ${rank === 'Gold' ? rankGlow : 'hover:bg-slate-50/50'}`}>
                                                        <td className="py-4 px-4 font-bold text-gray-800 flex items-center gap-2">
                                                            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                                                            Gold
                                                            {rank === 'Gold' && <span className="text-[10px] bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-bold ml-2">Active</span>}
                                                        </td>
                                                        <td className="py-4 px-4 text-center font-bold text-gray-600">25–49</td>
                                                        <td className="py-4 px-4 text-right font-black text-indigo-600">25%</td>
                                                    </tr>
                                                    <tr className={`border-b border-gray-50 transition-all rounded-2xl ${rank === 'Platinum' ? rankGlow : 'hover:bg-slate-50/50'}`}>
                                                        <td className="py-4 px-4 font-bold text-gray-800 flex items-center gap-2">
                                                            <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
                                                            Platinum
                                                            {rank === 'Platinum' && <span className="text-[10px] bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-bold ml-2">Active</span>}
                                                        </td>
                                                        <td className="py-4 px-4 text-center font-bold text-gray-600">50+</td>
                                                        <td className="py-4 px-4 text-right font-black text-indigo-600">30%</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* ── Referred Users List ── */}
                                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
                                        <div>
                                            <h3 className="font-black text-gray-900 text-base">Referred Partners</h3>
                                            <p className="text-xs text-gray-500 mt-0.5">Wallets registered using your link</p>
                                        </div>

                                        {referralsLoading ? (
                                            <div className="flex flex-col items-center justify-center py-10 gap-3">
                                                <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin" />
                                                <p className="text-xs text-gray-500 font-semibold">Loading partners...</p>
                                            </div>
                                        ) : referrals.length === 0 ? (
                                            <div className="text-center py-10 bg-slate-50/60 rounded-2xl border border-dashed border-gray-200">
                                                <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                                <p className="text-xs text-gray-600 font-bold">No referrals yet</p>
                                                <p className="text-[10px] text-gray-400 mt-1 max-w-[200px] mx-auto">Share your link with crypto developers to see them here.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                                                {referrals.map((ref, idx) => (
                                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-2xl hover:shadow-sm transition-all animate-fade-in">
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-mono font-bold text-gray-800 truncate">
                                                                {ref.walletAddress.slice(0, 6)}...{ref.walletAddress.slice(-4)}
                                                            </p>
                                                            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                                                                Joined {new Date(ref.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            {ref.subscribedPlan ? (
                                                                <span className="text-[9px] bg-indigo-100 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                                                    {ref.subscribedPlan}
                                                                </span>
                                                            ) : (
                                                                <span className="text-[9px] bg-gray-100 text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                                                    Free
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    {/* ══════════════════ PROFILE TAB ══════════════════ */}
                    {activeTab === 'profile' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* ── Left: Profile Card ── */}
                            <div className="lg:col-span-1 space-y-5">

                                {/* Avatar + Name Card */}
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                    {/* Cover banner */}
                                    <div className={`h-28 bg-gradient-to-br ${profile.avatarBg} relative`}>
                                        <div className="absolute inset-0 opacity-20" style={{
                                            backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)`,
                                            backgroundSize: '30px 30px'
                                        }} />
                                    </div>

                                    <div className="px-6 pb-6">
                                        {/* Avatar */}
                                        <div className="relative -mt-12 mb-4" ref={editing ? avatarRef : null}>
                                            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${profile.avatarBg} flex items-center justify-center text-3xl shadow-lg border-4 border-white relative`}>
                                                {profile.avatarEmoji}
                                                {editing && (
                                                    <button
                                                        onClick={() => setShowAvatarPicker(p => !p)}
                                                        className="absolute -bottom-2 -right-2 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-md hover:bg-primary-dark transition-colors"
                                                    >
                                                        <Camera className="w-3.5 h-3.5 text-white" />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Avatar Picker Popup */}
                                            {editing && showAvatarPicker && (
                                                <div className="absolute top-24 left-0 z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-72 animate-fade-in">
                                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Choose Emoji</p>
                                                    <div className="grid grid-cols-6 gap-2 mb-4">
                                                        {EMOJI_AVATARS.map(em => (
                                                            <button
                                                                key={em}
                                                                onClick={() => { setDraftField('avatarEmoji', em); }}
                                                                className={`text-2xl h-10 w-10 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors ${draft.avatarEmoji === em ? 'bg-primary/10 ring-2 ring-primary' : ''}`}
                                                            >{em}</button>
                                                        ))}
                                                    </div>
                                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Background</p>
                                                    <div className="grid grid-cols-4 gap-2">
                                                        {AVATAR_BG.map(bg => (
                                                            <button
                                                                key={bg}
                                                                onClick={() => setDraftField('avatarBg', bg)}
                                                                className={`h-8 rounded-lg bg-gradient-to-br ${bg} transition-all ${draft.avatarBg === bg ? 'ring-2 ring-offset-1 ring-primary scale-110' : 'hover:scale-105'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Name & address */}
                                        <div className="mb-4">
                                            <h2 className="text-xl font-black text-gray-900">
                                                {profile.displayName || <span className="text-gray-400 italic font-normal text-base">No display name</span>}
                                            </h2>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                <p className="font-mono text-xs text-gray-500">{getTruncatedAddress()}</p>
                                            </div>
                                        </div>

                                        {/* Bio */}
                                        {profile.bio && (
                                            <p className="text-sm text-gray-600 leading-relaxed mb-4 border-t border-gray-100 pt-4">{profile.bio}</p>
                                        )}

                                        {/* Meta info */}
                                        <div className="space-y-2 mb-4">
                                            {profile.location && (
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                                    <span>{profile.location}</span>
                                                </div>
                                            )}
                                            {profile.website && (
                                                <div className="flex items-center gap-2 text-sm text-primary">
                                                    <Link2 className="w-3.5 h-3.5 flex-shrink-0" />
                                                    <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                                                        target="_blank" rel="noopener noreferrer"
                                                        className="hover:underline truncate">{profile.website}</a>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                                <span>Connected {connectedDate}</span>
                                            </div>
                                        </div>

                                        {/* Social links */}
                                        <div className="flex items-center gap-2 flex-wrap mb-5">
                                            {profile.twitter && (
                                                <a href={`https://twitter.com/${profile.twitter.replace('@','')}`} target="_blank" rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 text-xs bg-sky-50 text-sky-600 border border-sky-200 px-3 py-1.5 rounded-full hover:bg-sky-100 transition-colors font-semibold">
                                                    <Twitter className="w-3 h-3" /> @{profile.twitter.replace('@','')}
                                                </a>
                                            )}
                                            {profile.github && (
                                                <a href={`https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors font-semibold">
                                                    <Github className="w-3 h-3" /> {profile.github}
                                                </a>
                                            )}
                                            {profile.linkedin && (
                                                <a href={`https://linkedin.com/in/${profile.linkedin}`} target="_blank" rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors font-semibold">
                                                    <Linkedin className="w-3 h-3" /> {profile.linkedin}
                                                </a>
                                            )}
                                            {!profile.twitter && !profile.github && !profile.linkedin && !editing && (
                                                <span className="text-xs text-gray-400 italic">No social links added</span>
                                            )}
                                        </div>

                                        {!editing && (
                                            <button
                                                onClick={() => { setDraft(profile); setEditing(true); }}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white text-sm font-bold rounded-xl hover:shadow-lg hover:scale-[1.01] transition-all"
                                            >
                                                <Edit3 className="w-4 h-4" /> Edit Profile
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Wallet Info */}
                                <div className="relative overflow-hidden bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-5 text-white shadow-lg">
                                    <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-3">
                                            <Wallet className="w-5 h-5 text-white/70" />
                                            <span className="text-[10px] bg-white/20 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">{walletType || 'MetaMask'}</span>
                                        </div>
                                        <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider mb-1">Wallet Address</p>
                                        <p className="font-mono text-xs font-semibold break-all mb-3 text-white/90">{walletAddress}</p>
                                        <div className="border-t border-white/20 pt-3 flex items-center justify-between">
                                            <div>
                                                <p className="text-white/50 text-[10px] mb-0.5">Connected</p>
                                                <p className="font-semibold text-sm">{connectedDate}</p>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                                <span className="text-green-300 font-bold text-xs">Active</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── Right: Edit Form ── */}
                            <div className="lg:col-span-2 space-y-5">

                                {/* Success Banner */}
                                {saved && (
                                    <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-5 py-4 animate-fade-in">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                                        <p className="text-green-700 font-semibold text-sm">Profile saved successfully!</p>
                                    </div>
                                )}

                                {editing ? (
                                    /* ── EDIT MODE ── */
                                    <>
                                        {/* Basic Info */}
                                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                            <h3 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
                                                <Sparkles className="w-4 h-4 text-yellow-500" /> Basic Information
                                            </h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Display Name</label>
                                                    <div className="relative">
                                                        <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                        <input
                                                            value={draft.displayName}
                                                            onChange={e => setDraftField('displayName', e.target.value)}
                                                            placeholder="e.g. Satoshi Fan"
                                                            maxLength={40}
                                                            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Bio</label>
                                                    <div className="relative">
                                                        <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                                        <textarea
                                                            value={draft.bio}
                                                            onChange={e => setDraftField('bio', e.target.value)}
                                                            placeholder="Tell the community about yourself..."
                                                            maxLength={200}
                                                            rows={3}
                                                            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                                                        />
                                                        <span className="absolute bottom-2 right-3 text-[10px] text-gray-400">{draft.bio.length}/200</span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Location</label>
                                                        <div className="relative">
                                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                            <input
                                                                value={draft.location}
                                                                onChange={e => setDraftField('location', e.target.value)}
                                                                placeholder="e.g. New York, USA"
                                                                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Website</label>
                                                        <div className="relative">
                                                            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                            <input
                                                                value={draft.website}
                                                                onChange={e => setDraftField('website', e.target.value)}
                                                                placeholder="yoursite.com"
                                                                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Social Links */}
                                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                            <h3 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
                                                <Globe className="w-4 h-4 text-blue-500" /> Social Links
                                            </h3>
                                            <div className="space-y-4">
                                                {[
                                                    { key: 'twitter', icon: Twitter, label: 'Twitter / X', placeholder: '@handle or handle', color: 'text-sky-500', prefix: 'twitter.com/' },
                                                    { key: 'github', icon: Github, label: 'GitHub', placeholder: 'username', color: 'text-gray-700', prefix: 'github.com/' },
                                                    { key: 'linkedin', icon: Linkedin, label: 'LinkedIn', placeholder: 'username', color: 'text-blue-600', prefix: 'linkedin.com/in/' },
                                                ].map(({ key, icon: Icon, label, placeholder, color, prefix }) => (
                                                    <div key={key}>
                                                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">{label}</label>
                                                        <div className="flex rounded-xl overflow-hidden border border-gray-200 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all">
                                                            <span className="flex items-center gap-2 px-3 bg-gray-50 border-r border-gray-200 text-xs text-gray-500 font-medium whitespace-nowrap">
                                                                <Icon className={`w-4 h-4 ${color}`} /> {prefix}
                                                            </span>
                                                            <input
                                                                value={draft[key]}
                                                                onChange={e => setDraftField(key, e.target.value)}
                                                                placeholder={placeholder}
                                                                className="flex-1 px-3 py-2.5 text-sm focus:outline-none bg-white"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Avatar Preview while editing */}
                                        <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-5 border border-blue-100">
                                            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                                <Camera className="w-4 h-4 text-primary" /> Avatar Preview
                                            </h3>
                                            <div className="flex items-center gap-4">
                                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${draft.avatarBg} flex items-center justify-center text-3xl shadow-md`}>
                                                    {draft.avatarEmoji}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{draft.displayName || 'Unnamed Explorer'}</p>
                                                    <p className="text-xs text-gray-500 font-mono">{getTruncatedAddress()}</p>
                                                    <button
                                                        onClick={() => setShowAvatarPicker(p => !p)}
                                                        className="mt-1.5 text-xs text-primary font-semibold hover:underline flex items-center gap-1"
                                                    >
                                                        <Camera className="w-3 h-3" /> Change Avatar
                                                    </button>
                                                    {showAvatarPicker && (
                                                        <div ref={avatarRef} className="mt-3 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-72 animate-fade-in">
                                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Emoji</p>
                                                            <div className="grid grid-cols-6 gap-1.5 mb-3">
                                                                {EMOJI_AVATARS.map(em => (
                                                                    <button key={em} onClick={() => setDraftField('avatarEmoji', em)}
                                                                        className={`text-xl h-9 w-9 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors ${draft.avatarEmoji === em ? 'bg-primary/10 ring-2 ring-primary' : ''}`}>
                                                                        {em}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Background</p>
                                                            <div className="grid grid-cols-4 gap-2">
                                                                {AVATAR_BG.map(bg => (
                                                                    <button key={bg} onClick={() => setDraftField('avatarBg', bg)}
                                                                        className={`h-8 rounded-lg bg-gradient-to-br ${bg} transition-all ${draft.avatarBg === bg ? 'ring-2 ring-offset-1 ring-primary scale-110' : 'hover:scale-105'}`} />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Save / Cancel */}
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={handleSave}
                                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-[1.01] transition-all text-sm"
                                            >
                                                <Save className="w-4 h-4" /> Save Profile
                                            </button>
                                            <button
                                                onClick={handleCancel}
                                                className="flex items-center gap-2 px-5 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all text-sm"
                                            >
                                                <X className="w-4 h-4" /> Cancel
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    /* ── VIEW MODE ── */
                                    <>
                                        {/* Profile completeness */}
                                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                                    <Sparkles className="w-4 h-4 text-yellow-500" /> Profile Completeness
                                                </h3>
                                                <button onClick={() => { setDraft(profile); setEditing(true); }}
                                                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                                                    <Edit3 className="w-3 h-3" /> Edit
                                                </button>
                                            </div>
                                            {(() => {
                                                const fields = [
                                                    { label: 'Display Name', done: !!profile.displayName },
                                                    { label: 'Bio', done: !!profile.bio },
                                                    { label: 'Location', done: !!profile.location },
                                                    { label: 'Website', done: !!profile.website },
                                                    { label: 'Twitter / X', done: !!profile.twitter },
                                                    { label: 'GitHub', done: !!profile.github },
                                                ];
                                                const done = fields.filter(f => f.done).length;
                                                const pct = Math.round((done / fields.length) * 100);
                                                return (
                                                    <>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-sm text-gray-600 font-medium">{done} of {fields.length} fields filled</span>
                                                            <span className="text-sm font-black text-primary">{pct}%</span>
                                                        </div>
                                                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-5">
                                                            <div className="h-full bg-gradient-to-r from-primary to-primary-dark rounded-full transition-all duration-700"
                                                                style={{ width: `${pct}%` }} />
                                                        </div>
                                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                            {fields.map(f => (
                                                                <div key={f.label} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${f.done ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'}`}>
                                                                    {f.done
                                                                        ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                                                                        : <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 flex-shrink-0" />}
                                                                    {f.label}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </div>

                                        {/* Identity Details */}
                                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                            <h3 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
                                                <User className="w-4 h-4 text-blue-500" /> Identity Details
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {[
                                                    { label: 'Display Name', value: profile.displayName, icon: AtSign },
                                                    { label: 'Location', value: profile.location, icon: MapPin },
                                                    { label: 'Website', value: profile.website, icon: Link2, link: true },
                                                    { label: 'Wallet Type', value: walletType || 'MetaMask', icon: Wallet },
                                                    { label: 'Connected', value: connectedDate, icon: Calendar },
                                                    { label: 'Network', value: 'Ethereum Mainnet', icon: Globe },
                                                ].map(({ label, value, icon: Icon, link }) => (
                                                    <div key={label} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                                                            <Icon className="w-4 h-4 text-gray-500" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{label}</p>
                                                            {value
                                                                ? link
                                                                    ? <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer"
                                                                        className="text-sm text-primary font-semibold hover:underline truncate block">{value}</a>
                                                                    : <p className="text-sm text-gray-800 font-semibold truncate">{value}</p>
                                                                : <p className="text-sm text-gray-300 italic">Not set</p>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Bio */}
                                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                            <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-purple-500" /> About Me
                                            </h3>
                                            {profile.bio
                                                ? <p className="text-gray-700 text-sm leading-relaxed">{profile.bio}</p>
                                                : (
                                                    <div className="text-center py-8 text-gray-400">
                                                        <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                                        <p className="text-sm italic">No bio yet.</p>
                                                        <button onClick={() => { setDraft(profile); setEditing(true); }}
                                                            className="mt-2 text-sm text-primary font-semibold hover:underline">Add a bio →</button>
                                                    </div>
                                                )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ══════════════════ OVERVIEW TAB ══════════════════ */}
                    {activeTab === 'overview' && (
                        <>
                            {/* Stats */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                <StatCard icon={Bookmark} label="Bookmarks" value={bookmarks?.length ?? 0} color="text-purple-700" bg="bg-white" />
                                <StatCard icon={Star} label="Reviews" value={myReviews.length} color="text-yellow-600" bg="bg-white" />
                                <StatCard icon={Eye} label="Sites Viewed" value="24" color="text-blue-700" bg="bg-white" />
                                <StatCard icon={Heart} label="Helpful Votes" value={myReviews.reduce((sum, rev) => sum + (rev.helpful || 0), 0)} color="text-pink-600" bg="bg-white" />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left 2/3 */}
                                <div className="lg:col-span-2 space-y-6">

                                    {/* Partner Program Highlight Banner */}
                                    <div className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10" />
                                        <div className="space-y-2 relative z-10">
                                            <div className="inline-flex items-center gap-1.5 bg-white/20 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                                <Award className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300/10" /> Partner Program Highlight
                                            </div>
                                            <h3 className="text-xl font-black">Earn commissions by inviting other projects!</h3>
                                            <p className="text-xs text-white/80 max-w-lg leading-relaxed">
                                                You have referred <strong className="text-white font-bold">{referrals.length} developers</strong>. 
                                                Your current partner rank is <strong className="text-yellow-300 font-black">{referrals.length >= 50 ? 'Platinum' : referrals.length >= 25 ? 'Gold' : referrals.length >= 10 ? 'Silver' : referrals.length >= 1 ? 'Bronze' : 'Starter'}</strong>.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setActiveTab('referrals')}
                                            className="px-5 py-2.5 bg-white hover:bg-gray-100 text-indigo-700 font-bold rounded-xl shadow-md text-xs whitespace-nowrap z-10 transition-transform active:scale-95"
                                        >
                                            View Referral Code 💎
                                        </button>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                        <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Zap className="w-4 h-4 text-yellow-500" /> Quick Actions
                                        </h2>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            <QuickActionCard icon={Globe} label="Browse" desc="Explore verified apps" to="/browse" gradient="from-blue-500 to-indigo-600" />
                                            <QuickActionCard icon={Bookmark} label="Bookmarks" desc="Your saved sites" to="/bookmarks" gradient="from-purple-500 to-pink-500" />
                                            <QuickActionCard icon={BarChart2} label="Rankings" desc="Top rated platforms" to="/rankings" gradient="from-green-500 to-emerald-600" />
                                            <QuickActionCard icon={Star} label="Review" desc="Rate a platform" to="/browse" gradient="from-orange-500 to-red-500" />
                                        </div>
                                    </div>

                                    {/* Recommended Sites */}
                                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                                <TrendingUp className="w-4 h-4 text-blue-500" /> Recommended For You
                                            </h2>
                                            <Link to="/browse" className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5">
                                                View All <ChevronRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </div>
                                        {loadingSites ? (
                                            <div className="space-y-3">
                                                {[1,2,3,4].map(i => <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />)}
                                            </div>
                                        ) : recentSites.length > 0 ? (
                                            <div className="space-y-2">
                                                {recentSites.map((site, i) => (
                                                    <Link key={site._id || i} to={`/website/${site.slug}`}
                                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all group">
                                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-black text-base flex-shrink-0 overflow-hidden">
                                                            {site.logo ? <img src={site.logo} alt={site.name} className="w-full h-full object-cover rounded-xl" /> : site.name?.[0]?.toUpperCase()}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-bold text-gray-900 text-sm">{site.name}</p>
                                                            <p className="text-xs text-gray-500 truncate">{site.category || 'Crypto Platform'}</p>
                                                        </div>
                                                        {site.isVerified && <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">✓</span>}
                                                        <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-primary transition-colors flex-shrink-0" />
                                                    </Link>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-400 text-sm text-center py-6">No sites available.</p>
                                        )}
                                    </div>

                                    {/* Bookmarks Preview */}
                                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                                <Bookmark className="w-4 h-4 text-purple-500" /> My Bookmarks
                                            </h2>
                                            <Link to="/bookmarks" className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5">
                                                View All <ChevronRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </div>
                                        {bookmarks?.length > 0 ? (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                {bookmarks.slice(0, 6).map((b, i) => (
                                                    <Link key={b._id || b.id || i} to={`/website/${b.slug}`}
                                                        className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50/50 transition-all">
                                                        <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs flex-shrink-0">
                                                            {b.name?.[0]?.toUpperCase()}
                                                        </div>
                                                        <span className="text-xs font-semibold text-gray-800 truncate">{b.name}</span>
                                                    </Link>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <Bookmark className="w-9 h-9 text-purple-200 mx-auto mb-2" />
                                                <p className="text-gray-400 text-sm">No bookmarks yet</p>
                                                <Link to="/browse" className="text-xs text-primary font-semibold hover:underline mt-1 inline-block">Browse platforms →</Link>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right 1/3 */}
                                <div className="space-y-5">

                                    {/* Profile snapshot */}
                                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                                <User className="w-4 h-4 text-blue-500" /> My Profile
                                            </h2>
                                            <button onClick={() => setActiveTab('profile')} className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5">
                                                Edit <Edit3 className="w-3 h-3 ml-0.5" />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${profile.avatarBg} flex items-center justify-center text-2xl shadow-sm flex-shrink-0`}>
                                                {profile.avatarEmoji}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-gray-900 text-sm truncate">{displayName}</p>
                                                <p className="font-mono text-xs text-gray-400">{getTruncatedAddress()}</p>
                                            </div>
                                        </div>
                                        {profile.bio && <p className="text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-3 line-clamp-3">{profile.bio}</p>}
                                        {!profile.bio && <p className="text-xs text-gray-400 italic border-t border-gray-100 pt-3">No bio set.</p>}
                                        <button onClick={() => setActiveTab('profile')} className="mt-3 w-full text-xs bg-gray-50 hover:bg-primary hover:text-white text-gray-600 font-semibold py-2 rounded-xl transition-all border border-gray-200 hover:border-primary">
                                            View Full Profile →
                                        </button>
                                    </div>

                                    {/* Trust Score */}
                                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                                        <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Award className="w-4 h-4 text-yellow-500" /> Trust Score
                                        </h2>
                                        <div className="flex items-center justify-center mb-4">
                                            <div className="relative w-28 h-28">
                                                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E5E7EB" strokeWidth="3" />
                                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1F8FE5" strokeWidth="3" strokeDasharray="72, 100" strokeLinecap="round" />
                                                </svg>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <span className="text-2xl font-black text-gray-900">72</span>
                                                    <span className="text-[10px] text-gray-500">/ 100</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            {[
                                                { label: 'Reviews', val: 3, max: 10, color: 'bg-blue-500' },
                                                { label: 'Bookmarks', val: bookmarks?.length ?? 0, max: 20, color: 'bg-purple-500' },
                                                { label: 'Reputation', val: 7, max: 10, color: 'bg-green-500' },
                                            ].map(({ label, val, max, color }) => (
                                                <div key={label}>
                                                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                        <span className="font-medium">{label}</span>
                                                        <span className="font-bold">{val}/{max}</span>
                                                    </div>
                                                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${(val / max) * 100}%` }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Recent Activity */}
                                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                                        <h2 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                            <Activity className="w-4 h-4 text-pink-500" /> Recent Activity
                                        </h2>
                                        {activities.map((a, i) => <ActivityItem key={i} {...a} />)}
                                    </div>

                                    {/* Community */}
                                    <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-5 border border-purple-100">
                                        <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                            <Users className="w-4 h-4 text-violet-600" /> Community
                                        </h2>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { label: 'Members', value: '50K+', icon: '👥' },
                                                { label: 'Reviews', value: '12K+', icon: '⭐' },
                                                { label: 'Verified Apps', value: '500+', icon: '✅' },
                                                { label: 'Your Rank', value: '#1,204', icon: '🏆' },
                                            ].map(({ label, value, icon }) => (
                                                <div key={label} className="bg-white rounded-xl p-2.5 text-center shadow-sm">
                                                    <div className="text-lg mb-0.5">{icon}</div>
                                                    <div className="font-black text-gray-900 text-sm">{value}</div>
                                                    <div className="text-[10px] text-gray-500 font-medium">{label}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                </div>
            </div>
        </PageLayout>
    );
};

export default Dashboard;
