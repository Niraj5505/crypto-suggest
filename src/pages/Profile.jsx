import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Wallet, ShieldAlert, CheckCircle, Heart, Star, Edit, ShieldCheck } from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import Breadcrumb from '../components/common/Breadcrumb';
import Button from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { useBookmark } from '../contexts/BookmarkContext';
import { getAdminReviews, deleteReview } from '../services/api';
import WebsiteCard from '../components/website/WebsiteCard';
import ReviewCard from '../components/reviews/ReviewCard';

const Profile = () => {
    const navigate = useNavigate();
    const { user, updateProfile, logout } = useAuth();
    const { isConnected, walletAddress, connectWallet } = useWallet();
    const { bookmarks } = useBookmark();

    // Editable profile states
    const [name, setName] = useState(user?.name || '');
    const [profileImage, setProfileImage] = useState(user?.profileImage || '');
    const [editMode, setEditMode] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // User reviews states
    const [userReviews, setUserReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);

    const breadcrumbItems = [
        { label: 'Home', href: '/' },
        { label: 'My Profile' }
    ];

    // Redirect if not authenticated
    useEffect(() => {
        if (!user) {
            navigate('/');
        }
    }, [user, navigate]);

    // Fetch user reviews
    const fetchUserReviews = async () => {
        if (!user) return;
        setLoadingReviews(true);
        try {
            const allReviews = await getAdminReviews();
            // Filter reviews matching user's linked wallet
            if (user.walletAddress) {
                const filtered = allReviews.filter(
                    r => r.walletAddress && r.walletAddress.toLowerCase() === user.walletAddress.toLowerCase()
                );
                setUserReviews(filtered);
            } else {
                setUserReviews([]);
            }
        } catch (error) {
            console.error('Failed to load user reviews:', error);
        } finally {
            setLoadingReviews(false);
        }
    };

    useEffect(() => {
        fetchUserReviews();
    }, [user]);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        setUpdating(true);

        try {
            await updateProfile({ name, profileImage });
            setSuccessMsg('✅ Profile details updated successfully!');
            setEditMode(false);
        } catch (error) {
            setErrorMsg(error.message || 'Failed to update profile.');
        } finally {
            setUpdating(false);
        }
    };

    const handleLinkWallet = async () => {
        setErrorMsg('');
        setSuccessMsg('');
        
        if (!walletAddress) {
            alert('🦊 Please connect MetaMask first using the wallet connection button in the header!');
            return;
        }

        try {
            await updateProfile({ walletAddress });
            setSuccessMsg('✅ Web3 wallet successfully linked to your account profile!');
        } catch (error) {
            setErrorMsg(error.message || 'Failed to link wallet.');
        }
    };

    const handleUnlinkWallet = async () => {
        if (window.confirm('Are you sure you want to unlink your Web3 wallet address from your email profile?')) {
            setErrorMsg('');
            setSuccessMsg('');
            try {
                await updateProfile({ walletAddress: null });
                setSuccessMsg('✅ Wallet unlinked successfully.');
            } catch (error) {
                setErrorMsg(error.message || 'Failed to unlink wallet.');
            }
        }
    };

    const handleDeleteOwnReview = async (id) => {
        if (window.confirm('Are you sure you want to delete your review?')) {
            try {
                await deleteReview(id);
                alert('✅ Review deleted successfully!');
                fetchUserReviews();
            } catch (error) {
                alert(`❌ Failed to delete review: ${error.message}`);
            }
        }
    };

    const avatarUrl = user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&size=128&background=0D6EFD&color=fff&bold=true`;

    return (
        <PageLayout>
            <div className="relative pb-20">
                {/* Decorative Background */}
                <div className="absolute top-0 left-0 w-full h-[450px] overflow-hidden z-0">
                    <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl"></div>
                    <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-accent/5 blur-3xl"></div>
                </div>

                <div className="container-custom relative z-10 pt-28 pb-12">
                    <Breadcrumb items={breadcrumbItems} />

                    {/* Alert banners */}
                    {successMsg && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-semibold max-w-4xl mx-auto shadow-sm">
                            {successMsg}
                        </div>
                    )}
                    {errorMsg && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-semibold max-w-4xl mx-auto shadow-sm">
                            {errorMsg}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        
                        {/* Profile Info & Actions */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-premium border border-gray-100 text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary to-accent" />
                                
                                <img
                                    src={avatarUrl}
                                    alt={user?.name}
                                    className="w-24 h-24 rounded-full border-4 border-white shadow-lg mx-auto mb-4 object-cover"
                                />

                                {editMode ? (
                                    <form onSubmit={handleSaveProfile} className="space-y-4 text-left">
                                        <div>
                                            <label className="block text-xs font-bold text-text-main mb-1">Name</label>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-250 rounded-xl text-sm font-semibold"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-text-main mb-1">Avatar Image URL</label>
                                            <input
                                                type="url"
                                                value={profileImage}
                                                onChange={(e) => setProfileImage(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-250 rounded-xl text-sm font-semibold"
                                                placeholder="https://example.com/avatar.jpg"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button type="submit" size="sm" className="flex-1 py-2 font-bold" disabled={updating}>
                                                Save
                                            </Button>
                                            <Button type="button" variant="outline" size="sm" className="flex-1 py-2 border-gray-250 font-bold" onClick={() => setEditMode(false)}>
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <h2 className="text-2xl font-black text-text-main">{user?.name}</h2>
                                        <p className="text-sm font-semibold text-text-muted mb-4">{user?.email}</p>
                                        
                                        <div className="flex items-center justify-center gap-2 mb-6">
                                            <span className="bg-green-50 border border-green-200 text-green-700 text-xs px-2.5 py-1 rounded-full font-bold select-none inline-flex items-center gap-1">
                                                <ShieldCheck className="w-3.5 h-3.5" />
                                                <span>Verified Account</span>
                                            </span>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <Button variant="outline" className="w-full py-2.5 flex items-center justify-center gap-2 border-gray-200 text-sm font-bold" onClick={() => setEditMode(true)}>
                                                <Edit className="w-4 h-4" />
                                                <span>Edit Profile</span>
                                            </Button>
                                            <Button variant="ghost" className="w-full py-2.5 text-sm font-bold text-red-500 hover:bg-red-50" onClick={logout}>
                                                Logout
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Wallet Link Panel */}
                            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-premium border border-gray-100">
                                <h3 className="text-lg font-bold text-text-main mb-4 flex items-center gap-2">
                                    <Wallet className="w-5 h-5 text-primary" />
                                    <span>Web3 Wallet Link</span>
                                </h3>

                                {user?.walletAddress ? (
                                    <div className="space-y-4">
                                        <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold rounded-xl leading-relaxed">
                                            Your profile is successfully linked to this MetaMask wallet address:
                                            <span className="font-mono block font-bold text-sm mt-1">{user.walletAddress}</span>
                                        </div>
                                        <Button variant="outline" className="w-full py-2 border-red-200 text-red-650 hover:bg-red-50 text-xs font-bold" onClick={handleUnlinkWallet}>
                                            Unlink Wallet
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <p className="text-xs text-text-muted leading-relaxed">
                                            Link your MetaMask address to unlock own review management and sync blockchain reports with your credentials profile.
                                        </p>
                                        {walletAddress ? (
                                            <div className="space-y-3">
                                                <div className="p-3 bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded-xl">
                                                    Connected wallet detected:
                                                    <span className="font-mono block font-bold text-sm mt-1">{walletAddress}</span>
                                                </div>
                                                <Button variant="primary" className="w-full py-2.5 text-xs font-bold" onClick={handleLinkWallet}>
                                                    Link Wallet to Profile
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="p-3.5 bg-yellow-50 border border-yellow-200 text-yellow-750 text-xs rounded-xl font-medium">
                                                ⚠️ Please connect MetaMask via the button in the header first to link it to your account.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Watchlist & Reviews Lists */}
                        <div className="lg:col-span-2 space-y-8">
                            
                            {/* Watchlist Section */}
                            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-premium border border-gray-100">
                                <h3 className="text-xl font-bold text-text-main mb-6 flex items-center gap-2">
                                    <Heart className="w-6 h-6 text-red-500 fill-current" />
                                    <span>My Watchlist ({bookmarks.length})</span>
                                </h3>

                                {bookmarks.length === 0 ? (
                                    <p className="text-text-muted text-sm py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-gray-200 font-semibold">
                                        No bookmarked platforms in your watchlist yet.
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {bookmarks.map(site => (
                                            <WebsiteCard key={site.id} website={site} viewMode="grid" />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Reviews Section */}
                            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-premium border border-gray-100">
                                <h3 className="text-xl font-bold text-text-main mb-6 flex items-center gap-2">
                                    <Star className="w-6 h-6 text-yellow-400 fill-current" />
                                    <span>My Submitted Reviews ({userReviews.length})</span>
                                </h3>

                                {!user?.walletAddress ? (
                                    <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-gray-200 px-4">
                                        <Wallet className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                        <p className="text-xs text-text-muted leading-relaxed font-semibold">
                                            Please link a MetaMask wallet address to your profile to synchronize and load your submitted reviews.
                                        </p>
                                    </div>
                                ) : loadingReviews ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-2"></div>
                                        <p className="text-xs text-text-muted">Loading reviews...</p>
                                    </div>
                                ) : userReviews.length === 0 ? (
                                    <p className="text-text-muted text-sm py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-gray-200 font-semibold">
                                        You haven't submitted any reviews for this linked wallet.
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        {userReviews.map(review => (
                                            <ReviewCard key={review._id || review.id} review={review} onDelete={handleDeleteOwnReview} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default Profile;
