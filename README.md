# Varta

Varta is a WhatsApp-style full-stack chat app built with Next.js 15, TypeScript, Tailwind CSS, and Firebase.

## Firebase setup

Create a Firebase project and enable:

- Authentication with email/password sign-in
- Firestore Database
- Firebase Storage

Copy `.env.example` to `.env.local` and fill in your Firebase web app credentials.

## Firestore data model

- `users/{uid}` stores profile records.
- `chats/{chatId}` stores participants and conversation previews.
- `chats/{chatId}/messages/{messageId}` stores text and image messages.

## Development

```bash
npm install
npm run dev
```
