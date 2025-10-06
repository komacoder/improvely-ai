# IELTS Band Uplift - Development Style Guide

> A comprehensive guide for developing the IELTS essay analysis application

## Quick Reference

- **Project**: IELTS essay analysis with AI-powered feedback
- **Stack**: React + TypeScript + Vite + shadcn/ui
- **Focus**: Educational, accessible, performant

## Table of Contents

1. [Project Overview](#project-overview)
2. [Quick Start](#quick-start)
3. [Code Standards](#code-standards)
4. [Component Patterns](#component-patterns)
5. [Styling System](#styling-system)
6. [TypeScript Guidelines](#typescript-guidelines)
7. [State Management](#state-management)
8. [API Integration](#api-integration)
9. [Performance & Accessibility](#performance--accessibility)
10. [Testing Strategy](#testing-strategy)

## Project Overview

IELTS Band Uplift is an AI-powered essay analysis platform that helps students improve their IELTS writing scores. The application provides real-time feedback, band score assessment, and generates improved essay versions.

## Quick Start

### Development Setup

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Run linting
bun run lint
```

### Key Technologies

| Category       | Technology                    | Purpose                     |
| -------------- | ----------------------------- | --------------------------- |
| **Framework**  | React 18.3.1 + TypeScript     | UI development              |
| **Build**      | Vite 5.4.19                   | Fast development & building |
| **UI**         | shadcn/ui + Tailwind CSS      | Component system            |
| **State**      | React Query + React Hook Form | Data management             |
| **Validation** | Zod                           | Schema validation           |
| **PDF**        | jsPDF + html2canvas           | Essay export                |

## Code Standards

### Naming Conventions

| Type           | Convention                  | Example               |
| -------------- | --------------------------- | --------------------- |
| **Components** | PascalCase                  | `EssayAnalyzer.tsx`   |
| **Hooks**      | camelCase with `use` prefix | `useEssayAnalysis.ts` |
| **Utilities**  | camelCase                   | `formatBandScore.ts`  |
| **Constants**  | UPPER_SNAKE_CASE            | `MAX_ESSAY_LENGTH`    |
| **Types**      | PascalCase                  | `EssayAnalysisResult` |

### File Organization

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── EssayAnalyzer.tsx
│   └── TypingAnimation.tsx
├── pages/              # Route components
├── hooks/              # Custom hooks
├── lib/                # Utilities
├── modules/            # Feature modules
│   ├── auth/
│   ├── essay/
│   └── plan/
└── services/           # API services
```

### Import Order

```typescript
// 1. React imports
import { useState, useEffect } from "react";

// 2. Third-party libraries
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

// 3. Internal components
import { EssayAnalyzer } from "@/components/EssayAnalyzer";

// 4. Utilities and hooks
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// 5. Types
import type { EssayAnalysisResult } from "@/modules/essay/types";
```

## Component Patterns

### Essay Analysis Component

```typescript
// components/EssayAnalyzer.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useEssayAnalysis } from "@/hooks/useEssayAnalysis";

interface EssayAnalyzerProps {
  onScoreUpdate: (band: number | null) => void;
  initialEssay?: string;
}

export const EssayAnalyzer = ({
  onScoreUpdate,
  initialEssay = "",
}: EssayAnalyzerProps) => {
  const [essay, setEssay] = useState(initialEssay);
  const { analyzeEssay, isLoading, results } = useEssayAnalysis();

  const handleAnalyze = async () => {
    const analysis = await analyzeEssay(essay);
    onScoreUpdate(analysis.band);
  };

  return (
    <div className="space-y-4">
      <textarea
        value={essay}
        onChange={(e) => setEssay(e.target.value)}
        placeholder="Enter your IELTS essay..."
        className="w-full min-h-[200px] p-4 border rounded-lg"
      />
      <Button onClick={handleAnalyze} disabled={!essay.trim() || isLoading}>
        {isLoading ? "Analyzing..." : "Analyze Essay"}
      </Button>
    </div>
  );
};
```

### Custom Hook Pattern

```typescript
// hooks/useEssayAnalysis.ts
import { useState } from "react";
import { essayAPI } from "@/modules/essay/essayAPI";

export const useEssayAnalysis = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<EssayAnalysisResult | null>(null);

  const analyzeEssay = async (essay: string) => {
    setIsLoading(true);
    try {
      const analysis = await essayAPI.analyze(essay);
      setResults(analysis);
      return analysis;
    } catch (error) {
      console.error("Analysis failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { analyzeEssay, isLoading, results };
};
```

## Styling System

### Design Tokens

```css
/* Primary Colors - IELTS Green Theme */
:root {
  --primary: 142 76% 36%; /* IELTS Green */
  --primary-foreground: 0 0% 98%;
  --accent: 217 91% 60%; /* Trust Blue */
  --success: 142 76% 36%; /* Success Green */
  --warning: 32 95% 44%; /* Warning Orange */
  --destructive: 0 84% 60%; /* Error Red */

  /* Semantic Colors */
  --background: 249 100% 98%; /* Light background */
  --foreground: 222 84% 5%; /* Text color */
  --muted: 210 40% 96%; /* Muted elements */
  --border: 214 32% 91%; /* Borders */
}
```

### Tailwind Usage

```typescript
// ✅ Good - Using design tokens
className = "bg-primary text-primary-foreground hover:bg-primary/90";

// ✅ Good - Responsive design
className = "p-4 sm:p-6 lg:p-8 text-sm sm:text-base";

// ❌ Bad - Hardcoded values
className = "bg-green-600 text-white hover:bg-green-700";
```

### Component Variants

```typescript
// Using class-variance-authority for consistent variants
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border border-input bg-background hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        default: "h-10 px-4",
        lg: "h-11 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

## Logo Design Guidelines

### Current Logo Analysis

The current logo features:

- **Icon**: Green graduation cap (mortarboard)
- **Text**: "IELTS Band Uplift" in bold black
- **Style**: Clean, educational, professional

### Suggested Improvements

#### 1. Enhanced Visual Hierarchy

```css
/* Logo container improvements */
.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  fill: hsl(var(--primary));
}

.logo-text {
  font-weight: 700;
  font-size: 1.5rem;
  color: hsl(var(--foreground));
}
```

#### 2. Color Variations

- **Primary**: Green graduation cap with blue accent
- **Monochrome**: For single-color applications
- **Inverted**: For dark backgrounds

#### 3. Responsive Sizes

```typescript
// Logo component with size variants
interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "full" | "icon" | "text";
}

const logoVariants = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};
```

### Brand Colors

```css
/* IELTS Brand Colors */
:root {
  --ielts-green: 142 76% 36%; /* Primary brand color */
  --ielts-blue: 217 91% 60%; /* Trust and reliability */
  --ielts-gold: 45 93% 47%; /* Achievement and success */
  --ielts-gray: 210 40% 96%; /* Neutral elements */
}
```

## TypeScript Guidelines

### Essential Types

```typescript
// Essay analysis types
interface EssayAnalysisResult {
  band: number;
  text: string;
  improvements: string[];
  sentences: SentenceMap[];
}

interface SentenceMap {
  original: string;
  improved: string;
  color: string;
  id: string;
}

// Union types for constrained values
type BandLevel = 7 | 8 | 9;
type AnalysisVariant = "default" | "detailed" | "minimal";
```

### Type Safety Best Practices

```typescript
// ✅ Good - Specific types
interface EssayAnalyzerProps {
  onScoreUpdate: (band: number | null) => void;
  initialEssay?: string;
}

// ❌ Bad - Using any
const handleData = (data: any) => {};

// ✅ Good - Type guards
const isAnalysisResult = (data: unknown): data is EssayAnalysisResult => {
  return typeof data === "object" && data !== null && "band" in data;
};
```

## State Management

### Local State Patterns

```typescript
// ✅ Good - Minimal, focused state
const [isAnalyzing, setIsAnalyzing] = useState(false);
const [analysisResult, setAnalysisResult] =
  useState<EssayAnalysisResult | null>(null);

// ✅ Good - Functional updates
const updateScore = (newScore: number) => {
  setAnalysisResult((prev) => (prev ? { ...prev, band: newScore } : null));
};
```

### Global State Strategy

- **React Query**: Server state and caching
- **Context API**: Authentication and theme
- **Local Storage**: User preferences and drafts

```typescript
// React Query for server state
const { data, isLoading, error } = useQuery({
  queryKey: ["essay-analysis", essayId],
  queryFn: () => essayAPI.getAnalysis(essayId),
});
```

## API Integration

### API Structure

```typescript
// modules/essay/essayAPI.ts
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

export const essayAPI = {
  analyze: async (essay: string) => {
    const response = await api.post("/analyze", { essay });
    return response.data;
  },

  getTopics: async () => {
    const response = await api.get("/topics");
    return response.data;
  },
};
```

### Error Handling

```typescript
// React Query with error handling
const { data, error, isLoading } = useQuery({
  queryKey: ["essay-analysis", essay],
  queryFn: () => essayAPI.analyze(essay),
  enabled: !!essay.trim(),
  retry: 2,
});

// Toast notifications for errors
useEffect(() => {
  if (error) {
    toast({
      title: "Analysis Failed",
      description: "Please try again later.",
      variant: "destructive",
    });
  }
}, [error]);
```

## Performance & Accessibility

### Performance Optimization

```typescript
// Code splitting for routes
const EssayAnalyzer = lazy(() => import("./pages/EssayAnalyzer"));

// Memoization for expensive components
const EssayResults = React.memo(({ data }: EssayResultsProps) => {
  return <div>{/* Results rendering */}</div>;
});

// Optimized re-renders
const handleAnalyze = useCallback(async (essay: string) => {
  const result = await analyzeEssay(essay);
  setResults(result);
}, []);
```

### Accessibility Standards

```typescript
// Semantic HTML with ARIA
<button
  aria-label="Analyze IELTS essay"
  aria-describedby="analysis-help"
  onClick={handleAnalyze}
>
  Analyze Essay
</button>

// Screen reader support
<div id="analysis-help" className="sr-only">
  Click to analyze your essay and receive band score feedback
</div>
```

## Testing Strategy

### Component Testing

```typescript
// Test essay analyzer component
describe("EssayAnalyzer", () => {
  it("analyzes essay and updates score", async () => {
    const mockOnScoreUpdate = jest.fn();
    render(<EssayAnalyzer onScoreUpdate={mockOnScoreUpdate} />);

    const textarea = screen.getByPlaceholderText("Enter your IELTS essay...");
    const button = screen.getByRole("button", { name: /analyze/i });

    fireEvent.change(textarea, { target: { value: "Test essay" } });
    fireEvent.click(button);

    expect(mockOnScoreUpdate).toHaveBeenCalled();
  });
});
```

---

## Quick Reference

### Development Commands

```bash
bun run dev          # Start development server
bun run build        # Build for production
bun run lint         # Run ESLint
bun run preview      # Preview production build
```

### Key Principles

1. **Consistency** - Follow established patterns
2. **Simplicity** - Keep components focused
3. **Performance** - Optimize for speed
4. **Accessibility** - Ensure usability for all
5. **Type Safety** - Leverage TypeScript

### Logo Improvements

- Enhanced visual hierarchy with proper spacing
- Color variations for different contexts
- Responsive sizing for different screen sizes
- Consistent brand colors (IELTS green, trust blue, success gold)
