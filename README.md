# Uplift Startup - IELTS Writing Essay Analyzer

A comprehensive web application for analyzing and improving IELTS writing essays with AI-powered feedback and band score predictions.

## 🚀 Features

- **Essay Analysis**: Upload and analyze IELTS writing essays
- **Band Score Prediction**: Get detailed band scores (7, 8, 9) with explanations
- **Sentence-by-Sentence Comparison**: Compare original and improved versions
- **Interactive Highlighting**: Hover to highlight corresponding sentences
- **PDF Export**: Download analysis results as PDF
- **User Authentication**: Secure login with phone/email verification
- **Submission History**: Track and review past submissions

## 🛠️ Technologies Used

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Radix UI, Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Authentication**: JWT tokens, Google OAuth
- **Form Handling**: React Hook Form with Zod validation
- **PDF Generation**: jsPDF, html2canvas
- **Icons**: Lucide React

## 📦 Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Setup

1. **Clone the repository**

   ```bash
   git clone <YOUR_REPOSITORY_URL>
   cd uplift-startup
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env.local` file in the root directory:

   ```env
   VITE_API_BASE_URL=your_api_base_url
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5173`

## 🏗️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run build:analyze` - Build with bundle analysis
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run clean` - Clean build artifacts

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── EssayAnalyzer.tsx
│   ├── EssayResults.tsx
│   └── ...
├── pages/              # Page components
│   ├── Index.tsx
│   ├── About.tsx
│   ├── Pricing.tsx
│   └── ...
├── modules/            # Feature modules
│   ├── auth/           # Authentication
│   ├── essay/          # Essay analysis
│   ├── plan/           # Subscription plans
│   └── ...
├── services/           # API services
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── types/              # TypeScript type definitions
```

## 🔧 Configuration

### Build Optimization

The project is configured with:

- **Code Splitting**: Automatic chunking for better performance
- **Tree Shaking**: Removes unused code
- **Minification**: Terser for production builds
- **Asset Optimization**: Image and CSS optimization

### Performance Features

- **Lazy Loading**: Components loaded on demand
- **Memoization**: Optimized re-renders
- **Service Worker**: Offline functionality
- **Caching**: Intelligent asset caching

## 🚀 Deployment

### Production Build

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Deployment Options

1. **Static Hosting** (Netlify, Vercel, GitHub Pages)
2. **Traditional Web Server** (Nginx, Apache)
3. **Container Deployment** (Docker)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 🔐 Environment Variables

| Variable                      | Description               | Required |
| ----------------------------- | ------------------------- | -------- |
| `VITE_API_BASE_URL`           | Backend API base URL      | Yes      |
| `VITE_GOOGLE_CLIENT_ID`       | Google OAuth client ID    | Yes      |
| `VITE_RECAPTCHA_SITE_KEY`     | reCAPTCHA site key        | Yes      |
| `VITE_ENABLE_ANALYTICS`       | Enable analytics tracking | No       |
| `VITE_ENABLE_ERROR_REPORTING` | Enable error reporting    | No       |

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation in `/docs`

## 🎯 Roadmap

- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Offline mode improvements
- [ ] Integration with more LMS platforms

---

**Built with ❤️ for IELTS students worldwide**
## second pr
