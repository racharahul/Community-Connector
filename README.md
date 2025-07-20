# The Community Connector Platform

## Project Overview

The Community Connector is a hyper-local online platform designed to connect residents within defined geographic communities (e.g., apartment complexes, gated communities, neighborhoods in Bengaluru) with local service providers who also reside within the same community. The platform fosters community engagement, builds trust, and provides convenient access to services that might otherwise go undiscovered among neighbors.

## Core Features

### Hyper-Local Focus
- Platform operates strictly within predefined residential communities
- All services offered and sought are within specific community boundaries

### Service Discovery
- Residents can discover services offered by neighbors
- Service providers can list their offerings to the community

### Trust and Quality Assurance
- Community-driven review system
- Identity and residency verification for both providers and customers
- User-initiated reviews with 1-5 star ratings and text comments

### Categorization System
- Multi-layered, dynamic categorization (Broad Categories, Sub-Categories, Tags/Keywords)
- Dynamic forms based on service category
- Search and filter by keyword, category, and hyper-local geo-location

## Key Constraints

### No Platform-Facilitated Payments
- The platform does NOT process, hold, or mediate financial transactions
- All payments occur off-platform, directly between customer and provider

### Desktop Web Application MVP
- Initial MVP is a web application optimized for desktop browsers
- No mobile app version for the MVP

### Location
- Initial target market: Residential communities in Bengaluru, Karnataka, India

## Service Scope

The platform facilitates the exchange of services, not direct product sales:

- **Home Services**: Handyman, Cleaning, Pet Care, Babysitting, Gardening, Appliance Repair, Plumbing, Electrician
- **Skills & Education**: Tutoring, Language Lessons, Music Classes, Yoga/Fitness Instruction, Computer Skills
- **Food & Culinary**: Home-cooked Meals, Baked Goods, Speciality Food Items, Catering
- **Personal Care & Wellness**: Haircutting, Beauty Services, Massage Therapy
- **Creative & Craft**: Custom Artwork, Handmade Items, Photography, Event Decor, Digital Design
- **Errands & Logistics**: Grocery Shopping, Local Deliveries, Package Drop-off/Pickup
- **Professional Services**: Basic Tech Support, Accounting Help, Writing/Editing

## Monetization Strategy

- Revenue exclusively from Service Providers (Sellers)
- Customers use the platform completely free of charge
- Monthly subscription model for service providers
- Integration with third-party subscription billing API (e.g., Razorpay, Stripe)

## MVP Focus

The MVP will focus strictly on core functionality to prove the concept rapidly, excluding:

- Complex scheduling
- Advanced analytics
- Real-time notifications beyond essential
- Complex dispute resolution for services
- Multiple provider subscription tiers
- Mobile app version

## Recent Updates

### Registration Form Enhancements
- Added missing `building` and `unit` fields to the registration form to match User model requirements
- Implemented dynamic building dropdown that populates based on selected community
- Enhanced error handling with detailed console logging for debugging registration issues
- Added validation for new fields in RegisterSchema using Yup
- Fixed server-side validation errors related to required fields
- Implemented form state management using Formik with comprehensive validation
- Added conditional form field rendering based on selected values
- Integrated with Material-UI components for consistent styling
- Implemented responsive grid layout for better mobile experience
- Added loading indicators for asynchronous operations

### User Authentication System
- Implemented secure user model with password encryption using bcrypt
- Created JWT-based authentication with token generation and verification
- Added role-based authorization (customer, provider, admin)
- Implemented user verification system with document upload support
- Added password reset functionality with secure token generation

### Backend Improvements
- Created test script (`createTestUser.js`) to verify User model functionality by directly adding a test user to the database
- Enhanced error logging in authentication controller to provide more detailed information about validation failures
- Added comprehensive debugging for registration process to identify data structure mismatches between frontend and backend
- Verified MongoDB connection and model validation rules

### Data Management
- Implemented community data seeding script (`seedCommunities.js`) with sample data for Bengaluru residential communities
- Added support for multiple building names within each community
- Included detailed community information (address, type, amenities, total units)

## Deployment Guide

### Deploying to Vercel

1. **Prerequisites**:
   - A Vercel account
   - Git repository with your project
   - MongoDB Atlas database (or other MongoDB provider)

2. **Environment Setup**:
   - Create a `.env.local` file with your environment variables
   - Make sure to set `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRE`, and `JWT_COOKIE_EXPIRE`
   - Set `NODE_ENV=production`

3. **Vercel Configuration**:
   - The project includes a `vercel.json` configuration file that sets up:
     - Backend API routes (`/api/*` → `server/server.js`)
     - Frontend static files serving
     - Build commands for both client and server

4. **Deployment Steps**:
   - Push your changes to your Git repository
   - Import your project in the Vercel dashboard
   - Set your environment variables in the Vercel project settings
   - Deploy the project

5. **Troubleshooting**:
   - If build fails, check the build logs for specific errors
   - Ensure MongoDB connection string is correct and accessible from Vercel
   - Verify all required environment variables are set in Vercel project settings
- Created data structure to support the building-unit relationship required for user registration

### API Development
- Implemented RESTful API endpoints for community management:
  - GET `/api/communities` - Retrieve all communities
  - GET `/api/communities/:id` - Get details of a specific community
  - POST `/api/communities` - Create a new community (admin only)
  - PUT `/api/communities/:id` - Update community details (admin only)
  - DELETE `/api/communities/:id` - Remove a community (admin only)
- Created Community model with comprehensive schema validation
- Added geospatial indexing support for future location-based queries
- Implemented proper error handling and validation for all API endpoints

### Frontend Components Implementation

#### Home Page
- Created responsive home page with hero banner, "How It Works" guide, service categories, platform features, and call-to-action sections
- Implemented using Material-UI components and React Router for navigation

#### Authentication
- Implemented Login page with form validation using Yup
- Created Registration page with community selection and user role options
- Integrated with AuthContext and AlertContext for state management

#### Dashboard
- Built comprehensive user dashboard with sections for overview, profile, subscription (for providers), and reviews
- Implemented dynamic data fetching for user-specific services, reviews, and subscription status
- Added navigation to related pages (service creation, profile editing, subscription management)

#### Service Management
- Developed ServiceListing component with advanced filtering (category, community, building, rating)
- Implemented search functionality, sorting options, and pagination
- Created ServiceDetail page with tabs for description and reviews
- Built CreateService form with:
  - Complete validation using Formik and Yup
  - Dynamic category-based fields
  - Multiple pricing models (fixed, hourly, range, custom)
  - Availability selection
  - Image upload with preview
  - User role verification