# AESCION Job Portal — Homepage

A production-ready React + TypeScript + Vite + Tailwind CSS homepage recreated from the supplied visual direction.

## Technologies

- React.js 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- React Hook Form
- Zod
- TanStack Query
- Lucide React icons

## Included

- AESCION company logo asset
- Responsive desktop/tablet/mobile navigation
- Header: Home, Application Tracker, Resume Builder, Employers, Blog
- Log In and Join Now actions
- AI-powered job-search hero section
- Professional technology-office hero image
- No "Upload Resume" button
- No "10K+ Active Jobs" image/card
- Explore Opportunities cards
- React Router placeholder routes for all header actions
- Axios client and TanStack Query job-search foundation
- Zod schema foundation for future search forms

## Run

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally:

http://localhost:5173

## Build

```bash
npm run build
npm run preview
```

## API

Set `VITE_API_BASE_URL` in a `.env` file when the backend is ready:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

The frontend currently uses `/api/jobs` as the foundation for the future job-search feature.

## Important

The supplied AESCION logo is stored at:

`src/assets/aescion-logo.png`

The office hero image is stored at:

`src/assets/hero-office.jpg`
