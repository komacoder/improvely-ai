import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuthContext } from '@/auth/hooks/useAuthContext';
import { useToast } from '@/hooks/use-toast';
import { useAuthLogout } from '@/auth/hooks/useAuthLogout';
import { Logo } from '@/components/Logo';

export const Navigation = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { authenticated } = useAuthContext();
  const handleLogout = useAuthLogout();

  const navItems = [
    { href: '/ielts-writing', label: 'Checker' },
    ...(authenticated ? [{ href: '/my-submissions', label: 'My Submissions' }] : []),
    { href: '/pricing', label: 'Pricing' },
    { href: '/rubrics', label: 'Rubrics' },
    { href: '/about', label: 'About' },
  ];

  return (
    <nav className="bg-card border-b border-border shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Logo size="md" variant="icon" />
            <span className="text-xl font-bold text-foreground">
              IELTS Band Uplift
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map(item => (
              <Link
                key={item.href}
                to={item.href}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.href
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                {item.label}
              </Link>
            ))}

            {authenticated && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="ml-4 flex items-center gap-2 text-red-500"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border mt-2 pt-2 pb-4">
            <div className="flex flex-col space-y-2">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === item.href
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {authenticated && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="mt-2 flex items-center gap-2 justify-start"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
