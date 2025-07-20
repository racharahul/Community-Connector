# Community Connector MVP Project Structure

## Frontend Structure (React)

```
/src
  /assets            # Static assets like images, icons, etc.
  /components        # Reusable UI components
    /common          # Common UI elements (buttons, inputs, etc.)
    /layout          # Layout components (header, footer, sidebar)
    /auth            # Authentication related components
    /profile         # User profile components
    /services        # Service listing and discovery components
    /reviews         # Review system components
  /contexts          # React context providers
  /hooks             # Custom React hooks
  /pages             # Page components
    /home            # Landing page
    /auth            # Login/Register pages
    /dashboard       # User dashboard
    /services        # Service listing and discovery
    /profile         # User profiles
    /admin           # Admin panel
  /services          # API service integrations
  /utils             # Utility functions
  /types             # TypeScript type definitions
  /styles            # Global styles and theme
  App.tsx            # Main App component
  index.tsx          # Entry point
```

## Backend Structure (Node.js/Express)

```
/server
  /config            # Configuration files
  /controllers       # Request handlers
  /middleware        # Express middleware
  /models            # Database models
  /routes            # API routes
  /services          # Business logic
  /utils             # Utility functions
  /validation        # Request validation
  server.js          # Entry point
```

## Database Schema (MongoDB)

### Users Collection
- _id: ObjectId
- email: String (unique)
- password: String (hashed)
- firstName: String
- lastName: String
- role: String (enum: 'customer', 'provider', 'admin')
- community: ObjectId (ref: 'Communities')
- building: String (e.g., 'Tower A', 'Block 2')
- unit: String (e.g., 'Apartment 301')
- phone: String
- isVerified: Boolean
- verificationDocuments: Array
- createdAt: Date
- updatedAt: Date

### Communities Collection
- _id: ObjectId
- name: String
- address: Object
  - street: String
  - city: String
  - state: String
  - postalCode: String
- type: String (enum: 'apartment', 'gated community', 'neighborhood')
- buildings: Array (e.g., ['Tower A', 'Tower B'])
- adminUsers: Array of ObjectId (ref: 'Users')
- createdAt: Date
- updatedAt: Date

### ServiceCategories Collection
- _id: ObjectId
- name: String
- description: String
- parentCategory: ObjectId (ref: 'ServiceCategories', null for top-level)
- formFields: Array (dynamic fields based on category)
- createdAt: Date
- updatedAt: Date

### Services Collection
- _id: ObjectId
- title: String
- description: String
- provider: ObjectId (ref: 'Users')
- category: ObjectId (ref: 'ServiceCategories')
- subCategory: ObjectId (ref: 'ServiceCategories')
- tags: Array of Strings
- priceInfo: String (description of pricing)
- availability: String
- images: Array of Strings (URLs)
- isActive: Boolean
- createdAt: Date
- updatedAt: Date

### Reviews Collection
- _id: ObjectId
- service: ObjectId (ref: 'Services')
- customer: ObjectId (ref: 'Users')
- rating: Number (1-5)
- comment: String
- providerResponse: String
- isReported: Boolean
- reportReason: String
- createdAt: Date
- updatedAt: Date

### Subscriptions Collection
- _id: ObjectId
- provider: ObjectId (ref: 'Users')
- plan: String (enum: 'basic', 'premium', etc.)
- status: String (enum: 'active', 'cancelled', 'expired')
- paymentGatewayId: String (ID from Razorpay/Stripe)
- startDate: Date
- endDate: Date
- createdAt: Date
- updatedAt: Date