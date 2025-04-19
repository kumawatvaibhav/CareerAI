# CareerAI - Career Guidance and Resume Builder

A modern web application that helps users build professional resumes and receive career guidance using AI-powered insights.

## Features

- Resume Builder with professional templates
- Career Guidance based on user profiles
- Modern, responsive UI with dark/light mode support
- PDF export functionality
- Interactive form components
- Real-time validation and feedback

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**:
  - Tailwind CSS
  - shadcn/ui components
  - Material-UI components
- **Form Handling**: React Hook Form with Zod validation
- **State Management**: React Query
- **Routing**: React Router DOM
- **PDF Generation**: html2pdf.js
- **UI Components**:
  - Radix UI primitives
  - Material-UI components
  - Custom components

## Prerequisites

- Node.js (Latest LTS version recommended)
- npm or bun package manager

## Getting Started

1. Clone the repository:

```sh
git clone <YOUR_GIT_URL>
```

2. Navigate to the project directory:

```sh
cd CareerAI
```

3. Install dependencies:

```sh
npm install
# or
bun install
```

4. Start the development server:

```sh
npm run dev
# or
bun run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Project Structure

```
CareerAI/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── utils/         # Utility functions
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Library configurations
│   └── App.tsx        # Main application component
├── public/            # Static assets
└── package.json       # Project dependencies and scripts
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
