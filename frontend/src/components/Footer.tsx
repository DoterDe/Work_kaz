import React from 'react';
import { Facebook, Instagram, Youtube, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center">
                <span className="text-white text-xl">Q</span>
              </div>
              <div className="font-semibold text-lg">Qazaq Video Learn</div>
            </div>
            <p className="text-sm text-muted-foreground">
              Learn Kazakh language through engaging video lessons with native speakers.
            </p>
          </div>
          
          {/* Learn */}
          <div>
            <h4 className="mb-4">Learn</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Beginner (A1-A2)</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Intermediate (B1-B2)</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Video Lessons</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Vocabulary</a></li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h4 className="mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
          
          {/* Connect */}
          <div>
            <h4 className="mb-4">Connect</h4>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© 2024 Qazaq Video Learn. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
