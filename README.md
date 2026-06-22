# Crypto Suggest

A comprehensive crypto website directory platform built with React and Tailwind CSS. Discover, compare, and explore the best crypto platforms and services in one place.

## 🚀 Features

- **10 Main Pages**: Home, Browse, Website Detail, Categories, Bookmarks, Submit, About, Contact, Compare, and NotFound
- **Website Comparison**: Advanced comparison tool to evaluate multiple crypto platforms side-by-side
- **Verified Listings**: Trust badges and verification indicators for reliable platforms
- **Bookmarks System**: Save your favorite platforms for quick access later
- **Advanced Search & Filter**: Multi-criteria filtering by category, features, blockchain, and more
- **Responsive Design**: Mobile-first approach with perfect tablet and desktop experiences
- **Modern UI/UX**: Smooth animations with Framer Motion, hover effects, and intuitive navigation
- **External Link Protection**: Modal confirmation before visiting external sites
- **Wallet Integration**: Context-based wallet connection management
- **No Backend Required**: All data is static, perfect for deployment

## 📦 Tech Stack

- **React 19+** - Latest React with modern hooks and features
- **Tailwind CSS** - Utility-first CSS framework with custom design system
- **React Router DOM v7** - Modern client-side routing
- **Lucide React** - Beautiful icon library for consistent UI
- **Framer Motion** - Smooth animations and transitions
- **React Slick** - Carousel components for featured content
- **Recharts** - Data visualization and charts
- **Vite** - Lightning-fast build tool and development server
- **ESLint** - Code quality and consistency enforcement

## 🛠️ Installation

```bash
# Clone the repository
git clone <your-repo-url>

# Navigate to project directory
cd Crypto_Suggest

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/
│   ├── common/          # Reusable UI components (Button, Card, Modal, etc.)
│   ├── layout/          # Header, Footer, PageLayout components
│   └── website/         # Website-specific components (WebsiteCard, etc.)
├── pages/               # All page components (Home, Browse, Compare, etc.)
├── contexts/            # React contexts (CompareContext, WalletContext)
├── data/                # Mock data (categories, websites, reviews)
├── utils/               # Helper functions and utilities
├── assets/              # Static assets and images
├── hooks/               # Custom React hooks
├── index.css            # Global styles and Tailwind imports
├── main.jsx             # Application entry point
└── App.jsx              # Main app with routing and providers
```

## 🎨 Key Components

- **Button**: Multiple variants (primary, secondary, outline, ghost) with loading states
- **Badge**: Verified, featured, category badges with different styles
- **Card**: Hover effects and featured variants with smooth transitions
- **Modal**: Animated modals with backdrop and close handlers
- **WebsiteCard**: Grid and list view modes with comparison functionality
- **LoadingSkeleton**: Shimmer loading states for better UX
- **EmptyState**: No results messaging with helpful suggestions
- **CompareBar**: Floating comparison bar for selected websites
- **Carousel**: Slick-based carousel for featured content
- **Charts**: Recharts integration for data visualization

## 📊 Mock Data

The platform includes comprehensive mock data:

- **15+ Categories**: Exchanges, NFT Marketplaces, Wallets, DeFi, Mining, Staking, etc.
- **100+ Websites**: Representative samples from each category with detailed information
- **User Reviews**: Rating and review system with pros/cons
- **Comparison Data**: Structured data for side-by-side platform comparison

All data is located in `src/data/` and can be easily expanded or replaced with real API data.

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Deploy to Vercel/Netlify

1. Push your code to GitHub
2. Connect your repository to Vercel or Netlify
3. Deploy with default settings (Vite detected automatically)

## 🎯 Usage

### Browse Websites
- Visit homepage and explore featured categories and trending platforms
- Use the advanced search bar to find specific platforms
- Filter by category, features, blockchain, verification status, and more
- Switch between grid and list views for better browsing

### Compare Platforms
- Select websites using the "Add to Compare" button
- Use the floating CompareBar to view selected items
- Navigate to the Compare page for detailed side-by-side analysis
- Export comparison results for reference

### View Website Details
- Click "View Details" on any website card
- Explore comprehensive tabs: Overview, Features, Details, Reviews
- See pros/cons, trust score, verification status, and user ratings
- Visit external websites safely with confirmation modals

### Submit a Website
- Navigate to "Submit Your Website" from the main menu
- Fill out the multi-step form with platform details
- Form data is logged to console (ready for backend integration)
- Includes verification steps and feature selection

## 🔒 Security Features

- External link confirmation modals to prevent phishing
- Verified badge system for trusted platforms
- Trust indicators and security scores throughout
- Scam-free listings promise with community verification
- Wallet connection context for secure integrations

## 📱 Responsive Breakpoints

- **Mobile**: < 640px (single column)
- **Tablet**: 640px - 1024px (2 columns)
- **Desktop**: > 1024px (3 columns)

## 🎨 Color Palette

- **Primary**: #1F8FE5 (Blue)
- **Primary Dark**: #0B3C5D
- **Accent**: #4FC3F7 (Light Blue)
- **Background Soft**: #F5F9FC
- **Text Main**: #1F2933
- **Text Muted**: #6B7280

## 🧪 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build locally
npm run lint     # Run ESLint for code quality
```

### Code Quality

- ESLint configuration for consistent code style
- React hooks plugin for best practices
- Modern ES6+ JavaScript features
- Component-based architecture with separation of concerns

## � Customization

### Adding New Categories

1. Update `src/data/categories.js` with new category data
2. Add corresponding websites to `src/data/websites.js`
3. Update category icons and colors in the design system

### Integrating Real APIs

Replace mock data in `src/data/` with API calls:
- Use React Query or SWR for data fetching
- Implement loading and error states
- Add caching strategies for better performance

## �📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

### Development Guidelines

- Follow the existing code style and component patterns
- Use TypeScript for new components (if adding)
- Test on multiple screen sizes before submitting
- Update documentation for new features

## 📧 Contact

For questions or feedback, visit the Contact page in the app or open an issue on GitHub.

---

Built with ❤️ for the crypto community

# crypto-suggest
