import { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { NavLink, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Ghost, 
  Home,
  Target,
  Calendar,
  BarChart3,
  DollarSign,
  Palette,
  BookOpen,
  Heart,
  PenTool,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LayoutProps {
  children: ReactNode;
  currentSection?: string;
}

const navigation = [
  { id: 'dashboard', name: 'Dashboard', icon: Home, color: 'text-primary' },
  { id: 'goals', name: 'Goals & Habits', icon: Target, color: 'text-primary' },
  { id: 'daily', name: 'Daily View', icon: Calendar, color: 'text-success' },
  { id: 'analytics', name: 'Analytics', icon: BarChart3, color: 'text-warning' },
  { id: 'savings', name: 'Savings', icon: DollarSign, color: 'text-success' },
  { id: 'portfolio', name: 'Portfolio', icon: Palette, color: 'text-creative' },
  { id: 'study', name: 'Study Progress', icon: BookOpen, color: 'text-primary' },
  { id: 'health', name: 'Health', icon: Heart, color: 'text-destructive' },
  { id: 'reflections', name: 'Reflections', icon: PenTool, color: 'text-muted-foreground' },
];

export default function FullScreenLayout({ children, currentSection = 'dashboard' }: LayoutProps) {
  const { user, signOut } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const sidebarWidth = sidebarCollapsed ? 'w-16' : 'w-64';

  return (
    <div className="h-screen bg-background overflow-hidden flex">
      {/* Mobile backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 64 : 256 }}
        className={`${sidebarWidth} fixed lg:relative inset-y-0 left-0 z-50 flex flex-col glass border-r border-border/30 lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between p-4 border-b border-border/30">
          <motion.div 
            className="flex items-center gap-3"
            animate={{ opacity: sidebarCollapsed ? 0 : 1 }}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-primary">
              <Ghost className="h-5 w-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="font-bold text-gradient text-sm">GHOST GOAL</h1>
                <p className="text-xs text-muted-foreground">Tracking</p>
              </div>
            )}
          </motion.div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex h-8 w-8 p-0"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const to = item.id === 'dashboard' ? '/' : `/${item.id}`;
            const isActive = location.pathname === to;
            
            return (
              <NavLink
                key={item.id}
                to={to}
                className="group relative"
                onClick={() => setMobileMenuOpen(false)}
              >
                <motion.div
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-primary/20 text-primary border border-primary/30' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <item.icon className={`h-4 w-4 ${item.color} ${isActive ? 'text-primary' : ''}`} />
                  
                  <AnimatePresence>
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Tooltip for collapsed state */}
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
                </motion.div>
              </NavLink>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-border/30 p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-3 p-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20">
                  <User className="h-4 w-4 text-primary" />
                </div>
                
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.div
                      className="flex-1 text-left"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                    >
                      <p className="text-sm font-medium truncate">
                        {user?.email?.split('@')[0] || 'Ghost'}
                      </p>
                      <p className="text-xs text-muted-foreground">Owner</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-border/30">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(true)}
            className="h-8 w-8 p-0"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <Ghost className="h-5 w-5 text-primary" />
            <span className="font-semibold text-gradient">Ghost Goal</span>
          </div>
          
          <div className="w-8" />
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}