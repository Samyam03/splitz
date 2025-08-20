# Splitz - Expense Splitting Application

A modern, real-time expense splitting application built with Next.js, Convex, and Clerk authentication.

## Features

- **Real-time Expense Tracking**: Split expenses with friends and groups in real-time
- **Smart Balance Calculations**: Automatic balance tracking and settlement management
- **Group Management**: Create and manage expense groups with multiple members
- **Email Notifications**: Get notified when expenses and settlements are added or deleted
- **Beautiful UI**: Modern, responsive design with smooth animations
- **Authentication**: Secure user authentication with Clerk

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Convex (serverless database and backend)
- **Authentication**: Clerk
- **Email Service**: Resend
- **UI Components**: Radix UI primitives

## Demo Accounts

Use any of the following demo credentials on the sign-in page:

- **Email**: test@email.com — **Password**: ExploreNow!2025
- **Email**: sam@gmail.com — **Password**: TalentPortal@2025
- **Email**: view@example.com — **Password**: TryThisDemo!88

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Convex account
- Clerk account
- Resend account (for email notifications)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd splitz
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Add your environment variables to `.env.local`:
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_JWT_ISSUER=your_clerk_jwt_issuer

# Convex
NEXT_PUBLIC_CONVEX_URL=your_convex_url

# Resend Email Service
RESEND_API_KEY=your_resend_api_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Email Notifications

The application includes comprehensive email notifications for:
- New expenses added
- Expenses deleted
- Settlements recorded
- Settlements deleted

See [EMAIL_SETUP.md](./EMAIL_SETUP.md) for detailed setup instructions.

## Project Structure

```
splitz/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication routes
│   ├── (main)/            # Main application routes
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
├── convex/               # Convex backend functions
│   ├── emails.ts         # Email notification system
│   ├── expense.ts        # Expense management
│   ├── groups.ts         # Group management
│   ├── settlements.ts    # Settlement management
│   └── users.ts          # User management
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
└── public/               # Static assets
```

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [Convex Documentation](https://docs.convex.dev)
- [Clerk Documentation](https://clerk.com/docs)
- [Resend Documentation](https://resend.com/docs)

## Deploy on Vercel

The easiest way to deploy your Splitz app is to use the [Vercel Platform](https://vercel.com/new).

1. Push your code to GitHub
2. Import your project to Vercel
3. Add your environment variables in the Vercel dashboard
4. Deploy!

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
