import { Mail, Moon, Sun, User, LayoutDashboard, Search, PlayCircle, Inbox, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getUserInitials = () => {
    if (!user?.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
    
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <header className="border-b bg-card shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate("/")}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="rounded-xl bg-gradient-primary p-2.5">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold tracking-tight">Email Management</h1>
                <p className="text-xs text-muted-foreground">Professional Dashboard</p>
              </div>
            </button>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              <Button
                variant={location.pathname === "/" ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate("/")}
                className="font-medium"
              >
                <LayoutDashboard className="h-4 w-4 mr-1.5" />
                Dashboard
              </Button>
              <Button
                variant={location.pathname === "/pipeline" ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate("/pipeline")}
                className="font-medium"
              >
                <PlayCircle className="h-4 w-4 mr-1.5" />
                Pipeline
              </Button>
              <Button
                variant={location.pathname === "/search" ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate("/search")}
                className="font-medium"
              >
                <Search className="h-4 w-4 mr-1.5" />
                Search
              </Button>
              <Button
                variant={location.pathname === "/inbox" ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate("/inbox")}
                className="font-medium"
              >
                <Inbox className="h-4 w-4 mr-1.5" />
                Inbox
              </Button>
            </nav>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9"
            >
              {theme === "light" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-primary text-white font-semibold text-sm">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">My Account</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Mail className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive cursor-pointer"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden grid grid-cols-2 gap-2 mt-4 pt-4 border-t">
          <Button
            variant={location.pathname === "/" ? "default" : "ghost"}
            size="sm"
            onClick={() => navigate("/")}
            className="font-medium"
          >
            <LayoutDashboard className="h-4 w-4 mr-1.5" />
            Dashboard
          </Button>
          <Button
            variant={location.pathname === "/pipeline" ? "default" : "ghost"}
            size="sm"
            onClick={() => navigate("/pipeline")}
            className="font-medium"
          >
            <PlayCircle className="h-4 w-4 mr-1.5" />
            Pipeline
          </Button>
          <Button
            variant={location.pathname === "/search" ? "default" : "ghost"}
            size="sm"
            onClick={() => navigate("/search")}
            className="font-medium"
          >
            <Search className="h-4 w-4 mr-1.5" />
            Search
          </Button>
          <Button
            variant={location.pathname === "/inbox" ? "default" : "ghost"}
            size="sm"
            onClick={() => navigate("/inbox")}
            className="font-medium"
          >
            <Inbox className="h-4 w-4 mr-1.5" />
            Inbox
          </Button>
        </nav>
      </div>
    </header>
  );
};
