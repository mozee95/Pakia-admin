# Pakia Admin Dashboard

A comprehensive admin dashboard for the Pakia construction materials e-commerce platform built with React, TypeScript, and Tailwind CSS.

## Features

- **Dashboard Overview**: Key statistics, recent orders, and low stock alerts
- **Product Management**: CRUD operations for products with image upload and variant management
- **Category Management**: Hierarchical category management with drag-and-drop reordering
- **Order Management**: Order tracking, status updates, and payment processing
- **User Management**: User account management and role-based access control
- **Analytics**: Revenue tracking and business insights
- **Responsive Design**: Mobile-friendly interface with modern UI components

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **HTTP Client**: Fetch API with custom service layer
- **Authentication**: Clerk (integration ready)
- **Form Handling**: React Hook Form with Yup validation

## Project Structure

```
src/
├── components/
│   ├── common/           # Reusable UI components
│   │   ├── Layout.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── Modal.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── StatCard.tsx
│   │   └── LoadingSpinner.tsx
│   ├── forms/            # Form components
│   └── tables/           # Table components
├── pages/                # Page components
│   ├── Dashboard.tsx
│   ├── Products.tsx
│   ├── Categories.tsx
│   ├── Orders.tsx
│   ├── Users.tsx
│   └── Settings.tsx
├── services/             # API service layer
│   ├── api.ts
│   ├── productService.ts
│   ├── categoryService.ts
│   ├── orderService.ts
│   └── userService.ts
├── types/                # TypeScript interfaces
│   ├── product.ts
│   ├── category.ts
│   ├── order.ts
│   ├── user.ts
│   └── api.ts
├── utils/                # Utility functions
│   ├── constants.ts
│   ├── formatters.ts
│   └── validators.ts
└── App.tsx
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Backend API server running on port 3000 (or configure REACT_APP_API_URL)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pakia-admin
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables file:
```bash
cp .env.example .env
```

4. Update environment variables:
```env
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

5. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`.

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (one-way operation)

## API Integration

The application includes a comprehensive API service layer with the following services:

### Product Service
- Product CRUD operations
- Image upload and management
- Stock management
- Bulk operations
- CSV import/export

### Order Service
- Order management and tracking
- Status updates
- Payment processing
- Analytics and reporting

### Category Service
- Category hierarchy management
- Brand management
- Icon upload

### User Service
- User account management
- Role-based access control
- Bulk operations

## Component Library

### Common Components

- **Layout**: Main application layout with sidebar and header
- **Sidebar**: Navigation sidebar with collapsible design
- **Header**: Top navigation bar with search and user menu
- **Modal**: Reusable modal component for forms and dialogs
- **StatusBadge**: Status indicator with color coding
- **StatCard**: Dashboard statistics card with trend indicators
- **LoadingSpinner**: Loading indicator component

### Styling Guidelines

The application follows a consistent design system:

- **Colors**: Primary blue (#2563eb), success green (#10b981), warning yellow (#f59e0b), error red (#ef4444)
- **Spacing**: Consistent spacing using Tailwind's spacing scale
- **Typography**: System font stack with proper hierarchy
- **Shadows**: Subtle shadows for depth and elevation
- **Borders**: Rounded corners and subtle borders

## Authentication

The application is prepared for Clerk authentication integration. To enable authentication:

1. Sign up for a Clerk account
2. Create a new application
3. Add your publishable key to the environment variables
4. Implement Clerk components in the authentication flow

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow React functional component patterns
- Use custom hooks for reusable logic
- Implement proper error handling
- Add loading states for better UX

### Performance
- Use React.memo for expensive components
- Implement pagination for large datasets
- Lazy load heavy components
- Optimize images and assets

### Accessibility
- Use semantic HTML elements
- Implement proper ARIA labels
- Ensure keyboard navigation
- Maintain color contrast ratios

## Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

### Environment Variables for Production

Ensure the following environment variables are set in your production environment:

- `REACT_APP_API_URL`: Your production API URL
- `REACT_APP_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.
