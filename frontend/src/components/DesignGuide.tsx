import React from 'react';
import { Card } from './ui/Card';

export function DesignGuide() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="mb-8">Qazaq Video Learn - Design Specifications</h1>
      
      <Card className="mb-8">
        <h2 className="mb-4">🎨 Brand Overview</h2>
        <p className="mb-4">
          Qazaq Video Learn is a modern educational platform designed to teach the Kazakh language 
          through engaging video lessons. The design emphasizes clarity, accessibility, and 
          Kazakh cultural identity.
        </p>
        <div className="bg-muted/50 p-4 rounded-xl">
          <h4 className="mb-2">Design Philosophy</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Modern and clean aesthetic</li>
            <li>• Educational and friendly tone</li>
            <li>• Subtle Kazakh cultural elements</li>
            <li>• Mobile-first responsive design</li>
            <li>• Accessibility-focused</li>
          </ul>
        </div>
      </Card>
      
      <Card className="mb-8">
        <h2 className="mb-4">🎨 Color System</h2>
        
        <div className="space-y-6">
          <div>
            <h4 className="mb-3">Primary Colors</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="w-full h-24 bg-[#1C6EFA] rounded-xl mb-2"></div>
                <div className="font-medium">Primary Blue</div>
                <div className="text-sm text-muted-foreground">#1C6EFA</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Main brand color for CTAs, links, primary actions
                </div>
              </div>
              
              <div>
                <div className="w-full h-24 bg-[#008F5A] rounded-xl mb-2"></div>
                <div className="font-medium">Secondary Green</div>
                <div className="text-sm text-muted-foreground">#008F5A</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Kazakh national color, success states, progress
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="mb-3">Accent & Supporting Colors</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="w-full h-24 bg-[#FFD34E] rounded-xl mb-2"></div>
                <div className="font-medium">Accent Yellow</div>
                <div className="text-sm text-muted-foreground">#FFD34E</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Kazakh national color, highlights, achievements
                </div>
              </div>
              
              <div>
                <div className="w-full h-24 bg-[#F7F9FB] rounded-xl mb-2 border border-border"></div>
                <div className="font-medium">Background</div>
                <div className="text-sm text-muted-foreground">#F7F9FB</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Main page background, subtle areas
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="mb-3">Text Colors</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="font-medium mb-1">Primary Text</div>
                <div className="text-sm text-muted-foreground">#1A1A1A</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Main content, headings, important text
                </div>
              </div>
              
              <div>
                <div className="font-medium mb-1">Secondary Text</div>
                <div className="text-sm text-muted-foreground">#6D6D6D</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Supporting text, captions, metadata
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      <Card className="mb-8">
        <h2 className="mb-4">📝 Typography</h2>
        
        <div className="space-y-6">
          <div>
            <h4 className="mb-3">Font Family</h4>
            <p className="text-muted-foreground mb-2">
              System font stack (optimized for readability across platforms)
            </p>
            <code className="text-sm bg-muted px-3 py-1 rounded">
              -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
            </code>
          </div>
          
          <div>
            <h4 className="mb-3">Type Scale</h4>
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <div className="text-4xl mb-1">Heading 1</div>
                <div className="text-sm text-muted-foreground">
                  40px (2.5rem) • Medium (500) • 1.5 line-height
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Usage: Main page titles, hero headings
                </div>
              </div>
              
              <div className="border-l-4 border-primary pl-4">
                <div className="text-3xl mb-1">Heading 2</div>
                <div className="text-sm text-muted-foreground">
                  32px (2rem) • Medium (500) • 1.5 line-height
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Usage: Section titles
                </div>
              </div>
              
              <div className="border-l-4 border-primary pl-4">
                <div className="text-2xl mb-1">Heading 3</div>
                <div className="text-sm text-muted-foreground">
                  24px (1.5rem) • Medium (500) • 1.5 line-height
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Usage: Card titles, subsections
                </div>
              </div>
              
              <div className="border-l-4 border-primary pl-4">
                <div className="text-base mb-1">Body Text</div>
                <div className="text-sm text-muted-foreground">
                  16px (1rem) • Regular (400) • 1.5 line-height
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Usage: Paragraphs, descriptions, content
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      <Card className="mb-8">
        <h2 className="mb-4">📐 Spacing & Layout</h2>
        
        <div className="space-y-6">
          <div>
            <h4 className="mb-3">Spacing Scale</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-4">
                <div className="w-16">4px</div>
                <div className="h-1 bg-primary" style={{ width: '4px' }}></div>
                <div className="text-muted-foreground">Minimal spacing</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16">8px</div>
                <div className="h-1 bg-primary" style={{ width: '8px' }}></div>
                <div className="text-muted-foreground">Tight spacing</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16">16px</div>
                <div className="h-1 bg-primary" style={{ width: '16px' }}></div>
                <div className="text-muted-foreground">Default spacing</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16">24px</div>
                <div className="h-1 bg-primary" style={{ width: '24px' }}></div>
                <div className="text-muted-foreground">Card padding</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16">32px</div>
                <div className="h-1 bg-primary" style={{ width: '32px' }}></div>
                <div className="text-muted-foreground">Section spacing</div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="mb-3">Border Radius</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="w-full h-16 bg-primary rounded-[16px] mb-2"></div>
                <div>16px</div>
                <div className="text-muted-foreground">Small elements</div>
              </div>
              <div>
                <div className="w-full h-16 bg-primary rounded-[20px] mb-2"></div>
                <div>20px</div>
                <div className="text-muted-foreground">Buttons, inputs</div>
              </div>
              <div>
                <div className="w-full h-16 bg-primary rounded-[24px] mb-2"></div>
                <div>24px</div>
                <div className="text-muted-foreground">Cards, containers</div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="mb-3">Max Width</h4>
            <div className="text-sm text-muted-foreground">
              <div>• Content container: 1280px (max-w-7xl)</div>
              <div>• Reading width: 672px (max-w-2xl)</div>
              <div>• Form width: 448px (max-w-md)</div>
            </div>
          </div>
        </div>
      </Card>
      
      <Card className="mb-8">
        <h2 className="mb-4">✨ Shadows & Effects</h2>
        
        <div className="space-y-4">
          <div className="p-6 bg-card shadow-sm border border-border rounded-2xl">
            <div className="font-medium mb-1">shadow-sm</div>
            <div className="text-sm text-muted-foreground">
              Default card shadow for subtle elevation
            </div>
          </div>
          
          <div className="p-6 bg-card shadow-md border border-border rounded-2xl">
            <div className="font-medium mb-1">shadow-md</div>
            <div className="text-sm text-muted-foreground">
              Hover states, interactive elements
            </div>
          </div>
          
          <div className="p-6 bg-card shadow-lg border border-border rounded-2xl">
            <div className="font-medium mb-1">shadow-lg</div>
            <div className="text-sm text-muted-foreground">
              Modals, popups, dropdowns
            </div>
          </div>
        </div>
      </Card>
      
      <Card className="mb-8">
        <h2 className="mb-4">🧩 Component Patterns</h2>
        
        <div className="space-y-4">
          <div>
            <h4 className="mb-2">Buttons</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Primary: Main CTAs, important actions (#1C6EFA)</li>
              <li>• Secondary: Alternative actions (#008F5A)</li>
              <li>• Accent: Special highlights (#FFD34E)</li>
              <li>• Outline: Secondary actions, cancel buttons</li>
              <li>• Ghost: Tertiary actions, subtle interactions</li>
            </ul>
          </div>
          
          <div>
            <h4 className="mb-2">Cards</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 24px border radius for modern feel</li>
              <li>• Soft shadow (shadow-sm) for depth</li>
              <li>• 24px padding for content breathing room</li>
              <li>• Hover state: lift + enhanced shadow</li>
            </ul>
          </div>
          
          <div>
            <h4 className="mb-2">Level Badges</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• A1: Green (#008F5A) - Beginner</li>
              <li>• A2: Blue (#1C6EFA) - Elementary</li>
              <li>• B1: Yellow (#FFD34E) - Intermediate</li>
              <li>• B2: Red (#FF6B6B) - Upper Intermediate</li>
            </ul>
          </div>
        </div>
      </Card>
      
      <Card className="mb-8">
        <h2 className="mb-4">📱 Responsive Breakpoints</h2>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-xl">
            <div>
              <div className="font-medium">Mobile</div>
              <div className="text-muted-foreground">0 - 767px</div>
            </div>
            <div className="text-muted-foreground">Single column, bottom nav</div>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-xl">
            <div>
              <div className="font-medium">Tablet (md:)</div>
              <div className="text-muted-foreground">768px - 1023px</div>
            </div>
            <div className="text-muted-foreground">2 columns, top nav</div>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-xl">
            <div>
              <div className="font-medium">Desktop (lg:)</div>
              <div className="text-muted-foreground">1024px+</div>
            </div>
            <div className="text-muted-foreground">3-4 columns, full layout</div>
          </div>
        </div>
      </Card>
      
      <Card>
        <h2 className="mb-4">🌟 Kazakh Cultural Elements</h2>
        
        <div className="space-y-4">
          <div>
            <h4 className="mb-2">Color Inspiration</h4>
            <p className="text-sm text-muted-foreground mb-2">
              The color palette is inspired by the Kazakh flag:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 🔵 Blue (#1C6EFA): Sky, freedom, cultural heritage</li>
              <li>• 🟡 Yellow (#FFD34E): Sun, prosperity, achievement</li>
              <li>• 🟢 Green (#008F5A): Growth, learning, progress</li>
            </ul>
          </div>
          
          <div>
            <h4 className="mb-2">Subtle Pattern Usage</h4>
            <p className="text-sm text-muted-foreground">
              Kazakh ornamental patterns (koshkar-muiz) are used subtly as background 
              elements and decorative accents, never overwhelming the modern, clean interface.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
