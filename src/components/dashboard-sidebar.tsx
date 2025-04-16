'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { signOut } from 'next-auth/react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const sidebarNavItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Data Kartu Keluarga',
    href: '/dashboard/kartu-keluarga',
    icon: Users,
  },
];

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  placeItems?: React.ReactNode;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn('pb-12', className)}>
      <div className="space-y-4 py-4">
        <div className="md:px-4 py-2">
          <h2 className="mb-2 px-2 text-xl font-semibold tracking-tight">
            Sistem KK
          </h2>
          <div className="space-y-1">
            {sidebarNavItems.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
      <div className="px-4 absolute bottom-4 left-0 right-0">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}

export function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px] pr-0">
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
}

interface DashboardSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'mobile' | 'tablet' | 'desktop';
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function DashboardSidebar({
  className,
  variant = 'desktop',
  isCollapsed = false,
  onToggleCollapse,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  // This ensures hydration matching by preventing rendering until client-side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const SidebarContent = (
    <div
      className={cn(
        'pb-12 h-full relative transition-all duration-300 ease-in-out',
        isCollapsed && variant === 'tablet' ? 'w-[70px]' : 'w-[240px]',
        className
      )}
    >
      {/* Collapse toggle button for tablet mode */}
      {variant === 'tablet' && (
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleCollapse}
          className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full border"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      )}

      <div className="space-y-4 py-4">
        <div
          className={cn(
            'px-4 py-2',
            isCollapsed && variant === 'tablet' && 'flex justify-center'
          )}
        >
          {!isCollapsed || variant !== 'tablet' ? (
            <h2 className="mb-2 px-2 text-xl font-semibold tracking-tight">
              Sistem KK
            </h2>
          ) : (
            <h2 className="mb-2 text-xl font-semibold tracking-tight">KK</h2>
          )}
          <div className="space-y-1">
            {sidebarNavItems.map((item) =>
              isCollapsed && variant === 'tablet' ? (
                <TooltipProvider key={item.href}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={pathname === item.href ? 'secondary' : 'ghost'}
                        size="icon"
                        className="w-full h-10 mb-1"
                        asChild
                      >
                        <Link href={item.href}>
                          <item.icon className="h-5 w-5" />
                          <span className="sr-only">{item.title}</span>
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.title}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <Button
                  key={item.href}
                  variant={pathname === item.href ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  asChild
                >
                  <Link href={item.href}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </Link>
                </Button>
              )
            )}
          </div>
        </div>
      </div>
      <div
        className={cn(
          'px-4 absolute bottom-4 left-0 right-0',
          isCollapsed && variant === 'tablet' && 'px-2'
        )}
      >
        {isCollapsed && variant === 'tablet' ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-full h-10"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="sr-only">Logout</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => signOut({ callbackUrl: '/' })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        )}
      </div>
    </div>
  );

  // Return only after client-side hydration to prevent mismatch
  if (!isClient) return null;

  // Mobile version uses a drawer/sheet
  if (variant === 'mobile') {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          {SidebarContent}
        </SheetContent>
      </Sheet>
    );
  }

  // Tablet or Desktop version
  return SidebarContent;
}

// Export a responsive wrapper component
export function ResponsiveSidebar() {
  const [, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>(
    'desktop'
  );
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    // Set initial value
    checkScreenSize();

    // Add event listener
    window.addEventListener('resize', checkScreenSize);

    // Clean up
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <>
      {/* Mobile burger menu */}
      <div className="lg:hidden">
        <DashboardSidebar variant="mobile" className="block" />
      </div>

      {/* Tablet sidebar (collapsible) */}
      <div className="hidden lg:block xl:hidden">
        <DashboardSidebar
          variant="tablet"
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
          className="h-screen border-r"
        />
      </div>

      {/* Desktop sidebar (always expanded) */}
      <div className="hidden xl:block">
        <DashboardSidebar
          variant="desktop"
          className="h-screen w-[240px] border-r"
        />
      </div>
    </>
  );
}
