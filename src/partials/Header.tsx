import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { MenuIcon } from 'lucide-react';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
  // Hide header when sidebar is open
  if (sidebarOpen) {
    return null;
  }

  return (
    <header className="sticky top-0 z-30 h-16">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Header: Left side */}
          <div className="mr-4 flex">
            {/* Hamburger button - Only show when sidebar is closed */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    onClick={() => setSidebarOpen(true)}
                    className="rounded-md"
                  >
                    <MenuIcon
                      style={{ width: '40px', height: '25px', color: 'gray' }}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="-ml-4">
                  <h6 className="p-1 text-xs font-semibold">Open sidebar</h6>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
