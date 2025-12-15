import React from 'react';
import { Button } from './ui/Button';
import { Menu, X } from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  
  const menuItems = [
    { label: 'Home', page: 'home' },
    { label: 'Courses', page: 'catalog' },

    { label: 'Vocabulary', page: 'vocabulary' },
  ];
  
  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => onNavigate('home')}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center">
              <span className="text-white text-xl">Q</span>
            </div>
            <div>
              <div className="font-semibold text-lg">Qazaq Video Learn</div>
              <div className="text-xs text-muted-foreground">Master Kazakh Language</div>
            </div>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {menuItems.map((item) => (
              <button
                key={item.page}
                onClick={() => onNavigate(item.page)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPage === item.page
                    ? 'text-primary bg-primary/10'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          
          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => onNavigate('login')}>
              Login
            </Button>
            <Button variant="primary" size="sm" onClick={() => onNavigate('register')}>
              Register
            </Button>
          </div>
          
          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            {menuItems.map((item) => (
              <button
                key={item.page}
                onClick={() => {
                  onNavigate(item.page);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  currentPage === item.page
                    ? 'text-primary bg-primary/10'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                {item.label}
              </button>
            ))}

            {/* Mobile Auth Buttons */}
            <div className="flex flex-col gap-2 mt-4 px-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onNavigate('login');
                  setMobileMenuOpen(false);
                }}
              >
                Login
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onNavigate('register');
                  setMobileMenuOpen(false);
                }}
              >
                Register
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
