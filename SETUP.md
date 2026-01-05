# Quick Setup Guide

## 1. Install Dependencies
```bash
npm install
```

## 2. Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable **Authentication** → **Email/Password** provider
3. Enable **Firestore Database** → Start in test mode (we'll add rules)
4. Go to **Project Settings** → **General** → **Your apps** → **Web app**
5. Copy your Firebase config

## 3. Create `.env` File

Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

## 4. Firestore Security Rules

1. Go to **Firestore Database** → **Rules** in Firebase Console
2. Copy the contents of `firestore.rules` file
3. Paste and **Publish** the rules

## 5. Run Locally

```bash
npm run dev
```

Visit http://localhost:3000

## 6. Deploy to Vercel

### Option A: Vercel CLI
```bash
npm i -g vercel
vercel login
vercel
```

### Option B: GitHub + Vercel Dashboard
1. Push code to GitHub
2. Import project in Vercel dashboard
3. Add environment variables (same as `.env` file)
4. Deploy

**Important**: Add all `VITE_FIREBASE_*` environment variables in Vercel project settings!

## Troubleshooting

- **"Firebase config missing"**: Check that all environment variables are set
- **"Permission denied"**: Verify Firestore security rules are published
- **"Stock price fetch failed"**: Check that the API endpoint is accessible (should work automatically on Vercel)

