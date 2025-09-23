import { RouteObject } from 'react-router-dom';
import { lazy, Suspense } from 'react';

import { AuthGuard } from '@/auth/guard';
import { Spinner } from '@/components/Spinner';

// Lazy load pages for better performance
const Index = lazy(() => import('@/pages/Index'));
const IeltsWriting = lazy(() => import('@/pages/IeltsWriting'));
const MySubmissions = lazy(() => import('@/pages/MySubmissions'));

// Loading component
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-background">
    <Spinner />
  </div>
);

export const dashboard: RouteObject[] = [
  {
    path: '/',
    children: [
      {
        path: '',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Index />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '/ielts-writing',
    children: [
      {
        path: '',
        element: (
          <Suspense fallback={<PageLoader />}>
            <IeltsWriting />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '/my-submissions',
    children: [
      {
        path: '',
        element: (
          <AuthGuard>
            <Suspense fallback={<PageLoader />}>
              <MySubmissions />
            </Suspense>
          </AuthGuard>
        ),
      },
    ],
  },
];
