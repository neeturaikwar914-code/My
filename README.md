# Varta

Varta is a WhatsApp-style full-stack chat app built with Next.js 15, TypeScript, Tailwind CSS, and the modular Firebase SDK.

## Firebase setup

The app is connected to the Firebase project `varta-2f722`. Firebase client configuration is read from `.env.local` with `NEXT_PUBLIC_` variables so it works correctly in a Next.js browser bundle.

Required Firebase products:

- Authentication with **Email/Password** and **Google** providers enabled
- Firestore Database
- Firebase Storage

## Environment variables

`.env.local` should contain:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBKvvkGnwCIIHE25_O5bSOsvVXXzt64kIo
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=varta-2f722.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=varta-2f722
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=varta-2f722.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=901856108485
NEXT_PUBLIC_FIREBASE_APP_ID=1:901856108485:web:d7e2988fe5d0a71d9c35ac
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-KJFMFTL8YS
```

## Firestore data model

- `users/{uid}` stores profile records and presence metadata.
- `chats/{chatId}` stores participants, denormalized participant previews, and last-message metadata.
- `chats/{chatId}/messages/{messageId}` stores text and image messages.

Realtime listeners are implemented for users, chats, and messages.

Image rendering is restricted to trusted Firebase Storage URLs. Malformed URLs, external hosts, and non-project Storage URLs are rejected before they reach `next/image`, and invalid images render a safe fallback.

## Security rules

Production-oriented starter rules are included in:

- `firestore.rules`
- `storage.rules`

Deploy them with the Firebase CLI after reviewing them for your exact production needs:

```bash
firebase deploy --only firestore:rules,storage
```

## Development

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run typecheck
npm run build
```
