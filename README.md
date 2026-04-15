# DAAIPS - Dimataling Agriculture Animals Insurance Processing System

DAAIPS is a full-stack application designed for the Municipality of Dimataling to manage and process agricultural insurance for livestock and other farm animals. It provides a platform for farmers to register, apply for insurance, and file claims, while allowing administrators to verify and manage these records.

## Features

- **Farmer Registration & Login**: Dedicated portal for farmers to manage their profiles.
- **Insurance Application**: Digital forms for applying for livestock insurance.
- **Claims Processing**: Streamlined interface for filing and tracking insurance claims.
- **Admin Dashboard**: Comprehensive management tool for municipal administrators.

## Tech Stack

- **Frontend**: React, Vite, TypeScript, Tailwind CSS, shadcn/ui.
- **Backend**: Node.js (Express), PostgreSQL.
- **State Management**: React Query.
- **Styling**: Tailwind CSS with custom animations.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [PostgreSQL](https://www.postgresql.org/) (running locally or remotely)
- npm or bun

### Local Development

1.  **Clone the repository**:
    ```sh
    git clone <YOUR_GIT_URL>
    cd DAAIPS
    ```

2.  **Install dependencies**:
    ```sh
    npm install
    ```

3.  **Setup the database**:
    Ensure your database credentials are set in a `.env` file (see `server/.env.example` if available) or use the setup script:
    ```sh
    npm run db:setup
    ```

4.  **Start the development server**:
    ```sh
    npm run dev:all
    ```
    This will start both the frontend (Vite) and the backend (Express) concurrently.

## Deployment

The project is configured for deployment on platforms like Render or Vercel.

- **Build command**: `npm run build`
- **Start command**: `npm run start`

## License

This project is developed for the Municipality of Dimataling. All rights reserved.
