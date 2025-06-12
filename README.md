# News Pay - News Analytics and Payout Dashboard

A modern web application that integrates with The Guardian API to fetch news articles, analyze author performance, and manage article payouts.

## Features

### News Feed
- Real-time news articles from The Guardian
- Advanced search functionality
- Author filtering
- Date range filtering
- Responsive grid layout for articles
- Article previews with images and descriptions

### Dashboard
- Author performance analytics
- Article count tracking
- Payout management system
- Interactive charts and visualizations
- Export functionality (PDF, CSV)
- Real-time data updates

### Analytics
- Payout distribution charts
- Article count by author
- Payout rate distribution
- Author performance metrics
- Interactive data visualization

### Firebase Integration
- Real-time data synchronization
- User authentication
- Cloud Firestore database
- Cloud Functions for backend operations
- Firebase Hosting for deployment

## Tech Stack

- **Frontend Framework**: Next.js 15
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **UI Components**: Custom UI components with Radix UI
- **Charts**: Recharts
- **Date Handling**: date-fns
- **PDF Generation**: jsPDF
- **CSV Handling**: PapaParse
- **Backend & Database**: Firebase
  - Authentication
  - Firestore
  - Cloud Functions
  - Hosting

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Guardian API key
- Firebase account and project

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Guardian API
NEXT_PUBLIC_GUARDIAN_API_KEY=your_guardian_api_key

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/news-pay.git
cd news-pay
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up Firebase:
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication, Firestore, and Hosting
   - Add your web app to the Firebase project
   - Copy the Firebase configuration to your `.env.local` file

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── page.js            # Home page with news feed
│   ├── dashboard/         # Dashboard page
│   └── layout.js          # Root layout
├── components/            # Reusable components
│   ├── ui/               # UI components
│   └── NewsCard.js       # News article card component
├── lib/                  # Utility functions and Redux store
│   ├── guardianSlice.js  # Guardian API integration
│   ├── store.js          # Redux store configuration
│   ├── firebase.js       # Firebase configuration
│   └── utils.js          # Utility functions
├── firebase/             # Firebase related files
│   ├── functions/        # Cloud Functions
│   └── rules/           # Security rules
└── styles/              # Global styles
```

## Features in Detail

### News Feed
The home page displays news articles from The Guardian with the following features:
- Search articles by keywords
- Filter by author
- Filter by date range
- Responsive grid layout
- Article previews with images
- Direct links to full articles

### Dashboard
The dashboard provides comprehensive analytics and payout management:
- View total articles and payouts
- Set custom payout rates per author
- Track article counts by author
- Export data to PDF or CSV
- Interactive charts and graphs

### Analytics
The dashboard includes various analytics visualizations:
- Payout distribution pie chart
- Article count bar chart
- Payout rate distribution
- Author performance line chart

### Firebase Integration
The application uses Firebase for backend services:

#### Authentication
- Email/Password authentication
- Google Sign-in
- User session management
- Protected routes

```

## API Integration

### Guardian API
The application uses The Guardian API to fetch news articles. The integration is handled through Redux in `guardianSlice.js` with the following features:
- Article fetching with pagination
- Search functionality
- Author filtering
- Date range filtering
- Error handling
- Loading states

### Firebase API
Firebase services are integrated for:
- User authentication and management
- Real-time data storage and synchronization
- Serverless backend operations
- Secure data access and manipulation

## Deployment

### Firebase Hosting
1. Build the application:
```bash
npm run build
# or
yarn build
```

2. Deploy to Firebase:
```bash
firebase deploy
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- The Guardian API for providing news data
- Firebase team for the amazing backend services
- Next.js team for the amazing framework
- All contributors who have helped with the project

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.
