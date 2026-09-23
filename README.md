# FinSight Frontend

This repository contains the React frontend for the FinSight application. It is built using React, Vite, Tailwind CSS, and Recharts.

## Prerequisites

- Node.js (v18 or higher recommended)
- npm (comes with Node.js)

## Setup and Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```

## Environment Variables

Create a `.env` file in the root directory. The following environment variables are used:

- `VITE_API_BASE_URL`: The base URL of the backend API.
  - **Local Development**: Leave this empty so that API calls use relative paths (e.g., `/api/...`) and are intercepted by the Vite dev proxy.
  - **Vercel / HTTPS Production**: Leave this **empty** as well. The app uses same-origin `/api/*` requests, which are proxied to the backend by `api/proxy.js` via `vercel.json`. Do **not** set this to an `http://` backend URL on Vercel — browsers block mixed-content requests from HTTPS pages.
  - **HTTP-only hosting (e.g. EC2/Nginx)**: You may set this to the full backend URL if needed (e.g., `http://13.233.207.68:8000`), or leave empty and proxy through Nginx.

## Available Scripts

- `npm run dev`: Starts the development server with Hot Module Replacement (HMR).
- `npm run build`: Compiles the application for production. The output will be placed in the `dist` directory.
- `npm run preview`: Previews the production build locally.
- `npm run lint`: Runs ESLint to check for code quality issues.

## Deployment Notes

The application can be deployed using standard static web hosting solutions or via platforms like Vercel.

### Nginx Deployment (Currently used on EC2)
When deploying via Nginx, it is critical to configure a fallback for the Single Page Application (SPA) routing, so that React Router can handle direct navigation to client-side routes without resulting in a 404 error.

Example Nginx configuration:
```nginx
server {
    listen 80;
    server_name tascade.fjtco.com;

    # Path to the built Vite dist folder
    root /var/www/tascade/dist;
    index index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Vercel Deployment
The repository includes a `vercel.json` configuration file which properly sets up rewrites so that `/api/*` requests bypass CORS and route appropriately.

## Pending Issues & Workarounds

- **Proxy/CORS:** In local development, cross-origin requests are handled by the Vite proxy configured in `vite.config.js`. Ensure that `VITE_API_BASE_URL` is unset locally to utilize this.
