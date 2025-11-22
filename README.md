# CardCompass Admin Panel

A modern, responsive admin panel for managing credit cards, offers, and tracking system activities for CardCompass.

## 🚀 Features

### Authentication
- ✅ Secure login with email/password
- ✅ Forgot password flow with email verification
- ✅ Reset password with token validation
- ✅ Profile management (update name and email)
- ✅ Change password functionality
- ✅ JWT token-based authentication with automatic token refresh
- ✅ Protected routes with authentication guards

### Dashboard
- ✅ Overview statistics (Total Cards, Active Offers, Hidden Offers, Featured Cards)
- ✅ Interactive card activity chart using Recharts
- ✅ Quick actions section
- ✅ Recent activity feed
- ✅ Responsive design with sidebar toggle

### Cards Management
- ✅ View all credit cards in a paginated table
- ✅ Search cards by name
- ✅ Filter by issuer and status
- ✅ Create new cards from external API
- ✅ Edit card metadata (category, active, featured status)
- ✅ Toggle active/featured status
- ✅ View card details and navigate to offers
- ✅ Pagination support

### Offers Management
- ✅ View all offers across all cards
- ✅ View offers for a specific card
- ✅ Create new offers
- ✅ Edit existing offers
- ✅ Set current offer
- ✅ Archive/unarchive offers
- ✅ Delete offers
- ✅ Toggle offer visibility
- ✅ Copy referral URLs
- ✅ Search and filter offers
- ✅ Highlight current offers

### Activity Log
- ✅ View all system activities and admin actions
- ✅ Filter by action type
- ✅ Search activities
- ✅ Pagination support
- ✅ Activity details with timestamps
- ✅ User attribution for each activity

### User Interface
- ✅ Responsive sidebar navigation
- ✅ Dark mode support
- ✅ Modern UI with Tailwind CSS
- ✅ Toast notifications for user feedback
- ✅ Form validation with error messages
- ✅ Loading states and error handling
- ✅ Accessible components (Radix UI)

## 🛠 Tech Stack

- **React 18** with **TypeScript** - UI framework
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **TanStack Query (React Query)** - Server state management and data fetching
- **React Hook Form** + **Zod** - Form handling and validation
- **Zustand** - Client-side state management
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives (shadcn/ui style)
- **Axios** - HTTP client for API calls
- **Recharts** - Chart library for data visualization
- **date-fns** - Date formatting utilities
- **js-cookie** - Cookie management
- **lucide-react** - Icon library

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── modals/          # Modal components (Card, Offer, Profile, etc.)
│   └── ui/              # shadcn/ui style components (Button, Dialog, etc.)
├── pages/               # Page components
│   ├── Dashboard.tsx
│   ├── Cards.tsx
│   ├── Offers.tsx
│   ├── OffersList.tsx
│   ├── ActivityLog.tsx
│   ├── Login.tsx
│   ├── ForgotPassword.tsx
│   └── ResetPassword.tsx
├── partials/            # Layout components
│   ├── ProtectedLayout.tsx
│   ├── Sidebar.tsx
│   └── Header.tsx
├── services/            # API service functions
│   └── api/
│       ├── apiService.ts      # Axios instance with interceptors
│       ├── apiUrl.ts          # API endpoint constants
│       ├── Auth/              # Authentication API
│       ├── Cards/             # Cards API
│       ├── Offers/            # Offers API
│       └── Activity/          # Activity log API
├── hooks/               # Custom React hooks
│   ├── apiHooks/       # React Query hooks
│   │   ├── Auth/
│   │   ├── Cards/
│   │   ├── Offers/
│   │   └── Activity/
│   └── use-toast.ts    # Toast notification hook
├── globalStateStore/    # Zustand store
├── lib/                 # Utility functions
├── types/               # TypeScript type definitions
└── css/                 # Global styles
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running (CardCompass Admin Backend)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd CardCompass_admin_frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run host` - Start dev server with network access
- `npm run typecheck` - Run TypeScript type checking

## 🔌 API Integration

The application integrates with the CardCompass Admin Backend API. All API calls are handled through:

- **Base URL**: Configured via `VITE_API_BASE_URL` environment variable
- **Authentication**: JWT tokens stored in cookies
- **Error Handling**: Centralized error handling with interceptors
- **Token Refresh**: Automatic token refresh on 401 errors

### API Endpoints Used

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

#### Cards
- `GET /api/cards` - Get all cards (with filters and pagination)
- `GET /api/cards/:id` - Get card by ID
- `POST /api/cards` - Create new card
- `PUT /api/cards/:id` - Update card
- `GET /api/cards/api/search` - Search cards from external API

#### Offers
- `GET /api/offers/cards/:cardId/offers` - Get offers for a card
- `POST /api/offers/cards/:cardId/offers` - Create new offer
- `PUT /api/offers/:id` - Update offer
- `PATCH /api/offers/:id/current` - Set offer as current
- `PATCH /api/offers/:id/archive` - Archive/unarchive offer
- `DELETE /api/offers/:id` - Delete offer

#### Activity Log
- `GET /api/activity` - Get activity logs (with filters and pagination)

## 🎨 Styling

The project uses **Tailwind CSS** for styling with a custom configuration. Key features:

- Responsive design with mobile-first approach
- Dark mode support
- Custom color palette (primary colors)
- Consistent spacing and typography
- Custom scrollbar hiding utility

## 🔐 Authentication Flow

1. User logs in with email/password
2. Backend returns JWT token
3. Token is stored in HTTP-only cookie
4. Token is automatically included in all API requests
5. On 401 errors, user is redirected to login
6. Token is cleared on logout

## 📱 Responsive Design

The application is fully responsive with:
- Mobile-first approach
- Collapsible sidebar on mobile
- Responsive tables with horizontal scroll
- Adaptive layouts for different screen sizes

## 🧪 Form Validation

All forms use **React Hook Form** with **Zod** schema validation:
- Real-time validation on blur
- Error messages displayed below fields
- Red borders for invalid fields
- Validation rules match backend requirements

## 🚨 Error Handling

- Centralized error handling in API service
- User-friendly error messages via toast notifications
- Automatic retry for failed requests (via React Query)
- Network error handling
- Validation error display

## 📦 Build & Deployment

### Production Build

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Environment Variables

Required environment variables:
- `VITE_API_BASE_URL` - Backend API base URL

## 🤝 Contributing

1. Follow the existing code structure
2. Use TypeScript for type safety
3. Follow React best practices
4. Ensure responsive design
5. Add proper error handling
6. Update documentation as needed

## 📝 License

Private project - All rights reserved

## 🔗 Related Projects

- **CardCompass Admin Backend** - Backend API for this admin panel

## 📞 Support

For issues or questions, please contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: 2025
