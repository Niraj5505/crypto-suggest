const API_URL = import.meta.env.VITE_API_URL || '/api';

const cleanUrl = (url) => {
    if (!url) return '';
    let clean = url.trim();
    // Strip leading list formatting like "1) ", "1. ", "1)", "1.", "[1]", etc. and whitespace
    clean = clean.replace(/^[0-9]+[\.\)]\s*/, '');
    clean = clean.replace(/^\[[0-9]+\]\s*/, '');
    clean = clean.trim();
    
    // Ensure it starts with http:// or https://
    if (!/^https?:\/\//i.test(clean)) {
        clean = `https://${clean}`;
    }
    return clean;
};

const getDeterministicViews = (name) => {
    if (!name) return 1200;
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const base = Math.abs(hash) % 27300;
    return base + 1200;
};

const mapWebsite = (site) => {
    if (!site) return null;
    return {
        ...site,
        id: site._id || site.id,
        url: cleanUrl(site.url),
        rating: site.trustScore || 4.0, // fallback to trustScore if rating is undefined
        views: getDeterministicViews(site.name),
    };
};

export const getCategories = async () => {
    try {
        const response = await fetch(`${API_URL}/categories`);
        if (!response.ok) throw new Error('Failed to fetch categories');
        const categories = await response.json();
        return categories.map(cat => ({
            ...cat,
            id: cat._id || cat.id
        }));
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
};

export const getWebsites = async (params = {}) => {
    try {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, value);
            }
        });

        const url = `${API_URL}/websites?${queryParams.toString()}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch websites');
        const websites = await response.json();
        return websites.map(mapWebsite);
    } catch (error) {
        console.error('Error fetching websites:', error);
        return [];
    }
};

export const getWebsiteBySlug = async (slug) => {
    try {
        const response = await fetch(`${API_URL}/websites/${slug}`);
        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error('Failed to fetch website detail');
        }
        const site = await response.json();
        return mapWebsite(site);
    } catch (error) {
        console.error(`Error fetching website detail (${slug}):`, error);
        return null;
    }
};

export const submitWebsite = async (formData) => {
    try {
        const response = await fetch(`${API_URL}/websites/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to submit website');
        return {
            ...data,
            website: mapWebsite(data.website)
        };
    } catch (error) {
        console.error('Error submitting website:', error);
        throw error;
    }
};

export const getReviews = async (slug) => {
    try {
        const response = await fetch(`${API_URL}/websites/${slug}/reviews`);
        if (!response.ok) throw new Error('Failed to fetch reviews');
        const reviews = await response.json();
        return reviews.map(rev => ({
            ...rev,
            id: rev._id || rev.id
        }));
    } catch (error) {
        console.error(`Error fetching reviews for ${slug}:`, error);
        return [];
    }
};

export const submitReview = async (slug, reviewData) => {
    try {
        const response = await fetch(`${API_URL}/websites/${slug}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reviewData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to submit review');
        return {
            ...data,
            id: data._id || data.id
        };
    } catch (error) {
        console.error('Error submitting review:', error);
        throw error;
    }
};

export const submitScamReport = async (slug, reportData) => {
    try {
        const response = await fetch(`${API_URL}/websites/${slug}/scam-report`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reportData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to submit scam report');
        return data;
    } catch (error) {
        console.error('Error submitting scam report:', error);
        throw error;
    }
};

export const getRankings = async () => {
    try {
        const response = await fetch(`${API_URL}/rankings`);
        if (!response.ok) throw new Error('Failed to fetch rankings');
        const data = await response.json();
        return {
            topRated: data.topRated.map(mapWebsite),
            trending: data.trending.map(mapWebsite),
            mostReviewed: data.mostReviewed ? data.mostReviewed.map(mapWebsite) : [],
            newListings: data.newListings.map(mapWebsite)
        };
    } catch (error) {
        console.error('Error fetching rankings:', error);
        return { topRated: [], trending: [], mostReviewed: [], newListings: [] };
    }
};

export const getAdminWebsites = async () => {
    try {
        const response = await fetch(`${API_URL}/admin/websites`);
        if (!response.ok) throw new Error('Failed to fetch admin websites');
        const websites = await response.json();
        return websites.map(mapWebsite);
    } catch (error) {
        console.error('Error fetching admin websites:', error);
        return [];
    }
};

export const verifyWebsite = async (slug) => {
    try {
        const response = await fetch(`${API_URL}/admin/websites/${slug}/verify`, {
            method: 'PUT'
        });
        if (!response.ok) throw new Error('Failed to verify website');
        return await response.json();
    } catch (error) {
        console.error(`Error verifying website (${slug}):`, error);
        throw error;
    }
};

export const deleteWebsite = async (slug) => {
    try {
        const response = await fetch(`${API_URL}/admin/websites/${slug}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete website');
        return await response.json();
    } catch (error) {
        console.error(`Error deleting website (${slug}):`, error);
        throw error;
    }
};

export const getAdminScamReports = async () => {
    try {
        const response = await fetch(`${API_URL}/admin/scam-reports`);
        if (!response.ok) throw new Error('Failed to fetch scam reports');
        return await response.json();
    } catch (error) {
        console.error('Error fetching scam reports:', error);
        return [];
    }
};

export const updateScamReportStatus = async (id, status) => {
    try {
        const response = await fetch(`${API_URL}/admin/scam-reports/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status }),
        });
        if (!response.ok) throw new Error('Failed to update scam status');
        return await response.json();
    } catch (error) {
        console.error(`Error updating scam status (${id}):`, error);
        throw error;
    }
};

export const getAdminReviews = async () => {
    try {
        const response = await fetch(`${API_URL}/admin/reviews`);
        if (!response.ok) throw new Error('Failed to fetch reviews');
        return await response.json();
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return [];
    }
};

export const deleteReview = async (id) => {
    try {
        const response = await fetch(`${API_URL}/admin/reviews/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete review');
        return await response.json();
    } catch (error) {
        console.error(`Error deleting review (${id}):`, error);
        throw error;
    }
};

export const updateUserBlockStatus = async (id, isBlocked) => {
    try {
        const response = await fetch(`${API_URL}/admin/users/${id}/block`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ isBlocked }),
        });
        if (!response.ok) throw new Error('Failed to update user block status');
        return await response.json();
    } catch (error) {
        console.error(`Error updating user block status (${id}):`, error);
        throw error;
    }
};

export const updateUserVerifyStatus = async (id, isVerified) => {
    try {
        const response = await fetch(`${API_URL}/admin/users/${id}/verify`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ isVerified }),
        });
        if (!response.ok) throw new Error('Failed to update user verify status');
        return await response.json();
    } catch (error) {
        console.error(`Error updating user verify status (${id}):`, error);
        throw error;
    }
};

// ==========================================
// User Authentication System API Requests
// ==========================================

const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const registerUser = async (name, email, password) => {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Registration failed');
    return data;
};

export const verifyOtp = async (email, otp) => {
    const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'OTP verification failed');
    return data;
};

export const resendOtp = async (email) => {
    const response = await fetch(`${API_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to resend OTP');
    return data;
};

export const loginUser = async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Login failed');
    return data;
};

export const forgotPasswordRequest = async (email) => {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Forgot password request failed');
    return data;
};

export const resetPasswordRequest = async (email, otp, password) => {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, password })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Password reset failed');
    return data;
};

export const getUserProfile = async () => {
    const response = await fetch(`${API_URL}/auth/profile`, {
        headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch user profile');
    return data;
};

export const updateUserProfile = async (profileData) => {
    const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to update user profile');
    return data;
};

export const getMyScamReports = async (walletAddress) => {
    try {
        const response = await fetch(`${API_URL}/scam-reports/my-reports?walletAddress=${encodeURIComponent(walletAddress)}`);
        if (!response.ok) throw new Error('Failed to fetch your scam reports');
        return await response.json();
    } catch (error) {
        console.error('Error fetching my scam reports:', error);
        return [];
    }
};

// ==========================================
// DB-backed User & Project API Requests
// ==========================================

export const getDbUser = async (walletAddress, referrer = null) => {
    try {
        let url = `${API_URL}/users/${encodeURIComponent(walletAddress)}`;
        if (referrer) {
            url += `?ref=${encodeURIComponent(referrer)}`;
        }
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch DB user profile');
        return await response.json();
    } catch (error) {
        console.error('Error fetching DB user:', error);
        return null;
    }
};

export const getDbUserReferrals = async (walletAddress) => {
    try {
        const response = await fetch(`${API_URL}/users/${encodeURIComponent(walletAddress)}/referrals`);
        if (!response.ok) throw new Error('Failed to fetch DB user referrals');
        return await response.json();
    } catch (error) {
        console.error('Error fetching DB user referrals:', error);
        return [];
    }
};

export const updateDbUser = async (walletAddress, profileData) => {
    try {
        const response = await fetch(`${API_URL}/users/${encodeURIComponent(walletAddress)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData)
        });
        if (!response.ok) throw new Error('Failed to update DB user profile');
        return await response.json();
    } catch (error) {
        console.error('Error updating DB user:', error);
        throw error;
    }
};

export const updateDbUserSubscription = async (walletAddress, planId, subscribedAt) => {
    try {
        const response = await fetch(`${API_URL}/users/${encodeURIComponent(walletAddress)}/subscription`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ planId, subscribedAt })
        });
        if (!response.ok) throw new Error('Failed to update DB user subscription');
        return await response.json();
    } catch (error) {
        console.error('Error updating DB user subscription:', error);
        throw error;
    }
};

export const getUserReviews = async (walletAddress) => {
    try {
        const response = await fetch(`${API_URL}/users/${encodeURIComponent(walletAddress)}/reviews`);
        if (!response.ok) throw new Error('Failed to fetch user reviews');
        return await response.json();
    } catch (error) {
        console.error('Error fetching user reviews:', error);
        return [];
    }
};

export const getDbUserProjects = async (walletAddress) => {
    try {
        const response = await fetch(`${API_URL}/users/${encodeURIComponent(walletAddress)}/projects`);
        if (!response.ok) throw new Error('Failed to fetch DB user projects');
        const projects = await response.json();
        return projects.map(p => ({ ...p, id: p._id || p.id }));
    } catch (error) {
        console.error('Error fetching DB user projects:', error);
        return [];
    }
};

export const addDbUserProject = async (walletAddress, projectData) => {
    try {
        const response = await fetch(`${API_URL}/users/${encodeURIComponent(walletAddress)}/projects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(projectData)
        });
        if (!response.ok) throw new Error('Failed to create DB user project');
        const project = await response.json();
        return { ...project, id: project._id || project.id };
    } catch (error) {
        console.error('Error creating DB user project:', error);
        throw error;
    }
};

export const updateDbUserProject = async (walletAddress, projectId, projectData) => {
    try {
        const response = await fetch(`${API_URL}/users/${encodeURIComponent(walletAddress)}/projects/${projectId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(projectData)
        });
        if (!response.ok) throw new Error('Failed to update DB user project');
        const project = await response.json();
        return { ...project, id: project._id || project.id };
    } catch (error) {
        console.error('Error updating DB user project:', error);
        throw error;
    }
};

export const deleteDbUserProject = async (walletAddress, projectId) => {
    try {
        const response = await fetch(`${API_URL}/users/${encodeURIComponent(walletAddress)}/projects/${projectId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete DB user project');
        return await response.json();
    } catch (error) {
        console.error('Error deleting DB user project:', error);
        throw error;
    }
};

export const getAdminUsers = async () => {
    try {
        const response = await fetch(`${API_URL}/admin/users`);
        if (!response.ok) throw new Error('Failed to fetch admin users');
        return await response.json();
    } catch (error) {
        console.error('Error fetching admin users:', error);
        return [];
    }
};

export const getAdminProjects = async () => {
    try {
        const response = await fetch(`${API_URL}/admin/projects`);
        if (!response.ok) throw new Error('Failed to fetch admin projects');
        const projects = await response.json();
        return projects.map(p => ({ ...p, id: p._id || p.id }));
    } catch (error) {
        console.error('Error fetching admin projects:', error);
        return [];
    }
};

export const createAdminProject = async (projectData) => {
    try {
        const response = await fetch(`${API_URL}/admin/projects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(projectData),
        });
        if (!response.ok) throw new Error('Failed to create admin project');
        return await response.json();
    } catch (error) {
        console.error('Error creating admin project:', error);
        throw error;
    }
};

export const updateAdminProject = async (id, projectData) => {
    try {
        const response = await fetch(`${API_URL}/admin/projects/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(projectData),
        });
        if (!response.ok) throw new Error('Failed to update admin project');
        return await response.json();
    } catch (error) {
        console.error(`Error updating admin project (${id}):`, error);
        throw error;
    }
};

export const deleteAdminProject = async (id) => {
    try {
        const response = await fetch(`${API_URL}/admin/projects/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete admin project');
        return await response.json();
    } catch (error) {
        console.error(`Error deleting admin project (${id}):`, error);
        throw error;
    }
};
