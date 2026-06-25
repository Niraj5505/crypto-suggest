import React from 'react';
import { Link } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import Breadcrumb from '../components/common/Breadcrumb';
import Card from '../components/common/Card';
import { mockCategories } from '../data/mockData';

const Categories = () => {
    const breadcrumbItems = [
        { label: 'Home', href: '/' },
        { label: 'All Categories' }
    ];

    // Helper to dynamically get icon component
    const getIconComponent = (iconName) => {
        const Icon = LucideIcons[iconName] || LucideIcons.HelpCircle;
        return <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />;
    };

    const getGradient = (index) => {
        const gradients = [
            'from-blue-500 to-cyan-400',
            'from-purple-500 to-indigo-500',
            'from-pink-500 to-rose-500',
            'from-orange-500 to-yellow-500',
            'from-emerald-500 to-teal-500',
            'from-cyan-500 to-blue-500'
        ];
        return gradients[index % gradients.length];
    };

    return (
        <PageLayout>
            <div className="relative pb-24 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[600px] z-0 opacity-30 pointer-events-none">
                    <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
                    <div className="absolute top-40 -left-20 w-80 h-80 bg-accent/20 rounded-full blur-3xl"></div>
                </div>

                <div className="container-custom relative z-10 pt-28 pb-12">
                    <Breadcrumb items={breadcrumbItems} />

                    <div className="mb-16 text-center max-w-3xl mx-auto">
                        <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 animate-fade-in">
                            <span className="text-primary font-bold tracking-wide text-xs uppercase">
                                Directory
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-text-main mb-6 tracking-tight">
                            Explore by <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Category</span>
                        </h1>
                        <p className="text-text-muted text-xl leading-relaxed">
                            Browse our curated list of crypto platforms by category. Find the perfect tools and services tailored to your needs.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {mockCategories.map((category, index) => {
                            const gradient = getGradient(index);
                            return (
                                <Link key={category.id || category.slug} to={`/category/${category.slug}`} className="group">
                                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-white/60 h-full relative overflow-hidden hover:bg-white/90">
                                        {/* Decorative gradient corner */}
                                        <div className={`absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-bl-full -mr-10 -mt-10 transition-opacity group-hover:opacity-20`}></div>

                                        {/* Subtle shine effect on hover */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                        <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 sm:mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative z-10`}>
                                            <img 
                                                src={`https://www.google.com/s2/favicons?domain=${category.brandDomain}&sz=128`}
                                                alt={category.name}
                                                className="w-7 h-7 sm:w-9 sm:h-9 object-contain bg-white rounded-lg p-1 shadow-sm"
                                            />
                                        </div>

                                        <h3 className="text-lg sm:text-xl font-bold text-text-main mb-2 group-hover:text-primary transition-colors relative z-10">{category.name}</h3>
                                        <p className="text-sm sm:text-base text-text-muted font-medium mb-4 sm:mb-6 relative z-10">{category.websiteCount} Verified Apps</p>

                                        <div className="flex items-center text-xs sm:text-sm font-bold text-gray-400 group-hover:text-primary transition-colors relative z-10">
                                            Explore <LucideIcons.ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default Categories;
