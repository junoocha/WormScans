# WormScans - Manga/Manhwa Reader Platform

A full-stack web app built with **Next.js 13 (App Router)** and **Supabase** that lets users browse, read, and upload manga/manhwa/manhua series.  
Includes an **admin dashboard** for managing series, chapters, and covers.

Access it here:

---

## Features

### User-Facing

- Browse all available series with filters by **status** (ongoing/completed/dropped) and **origin** (manga/manhwa/manhua).
- View paginated series lists with search + sorting.
- Read chapters with **chapter navigation** (prev/next buttons + dropdown).
- **Keyboard navigation** (←/→ keys) for quick chapter flipping.
- **Back to top** button for easy scrolling.
- Mobile friendly.

### Authentication

- Supabase email/password authentication.
- Forgot password & reset password flows.
- Protected admin signup (requires **admin key**).

### Security

- Only users with the admin key can create admin accounts.
- Supabase is configured to not reveal if an email exists during password reset for extra privacy.
- All database actions are performed via Supabase client with RLS (Row Level Security).
- Protected admin authorization (requires login to access admin).

### Admin Dashboard

- Manage series (title, description, cover image, status, origin).
- Upload new cover images via Supabase storage.
- Update existing series details.
- Update and delete existing chapter details
- Access to scrape chapters from websites and upload them to WormScans.

---

## Tech Stack

- **Framework**: [Next.js 13+ (App Router)](https://nextjs.org/)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **UI & Styling**: Tailwind CSS + custom variables (`--background`, `--card-bg`, `--accent`, etc.)
- **Icons**: [Lucide](https://lucide.dev/)
- **Notifications**: [react-hot-toast](https://react-hot-toast.com/)

---

## Setup & Installation (if you want to run this yourself for some reason)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

If you somehow get the environment variables or I give them to you, create a .env.local file in the root directory and add:

```bash
NEXT_PUBLIC_SUPABASE_URL=why-would-i-give-you-my-key
SUPABASE_SERVICE_ROLE_KEY=imagine-pushing-env-local-to-github
NEXT_PUBLIC_ADMIN_KEY=wait-how-do-you-have-them
```

### 4. Run the dev server

```bash
npm run dev
```

App will be available at http://localhost:3000
