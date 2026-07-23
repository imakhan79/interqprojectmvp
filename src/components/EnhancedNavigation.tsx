import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, Star, Settings, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { supabase } from "@/integrations/supabase/client";

interface NavItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<any>;
  description?: string;
  children?: NavItem[];
}

const EnhancedNavigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems: NavItem[] = [
    {
      label: "Product",
      children: [
        {
          label: "Features",
          href: "/features",
          icon: Star,
          description: "Explore all platform capabilities"
        },
        {
          label: "Integrations",
          href: "/integrations",
          icon: Star,
          description: "Connect with your tools"
        }
      ]
    },
    {
      label: "Assessments",
      href: "/assessments",
    },
    {
      label: "Solutions",
      href: "/solutions",
    },
    {
      label: "Pricing",
      href: "/pricing",
    },
  ];

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .single();
        setIsAdmin(!!data);
      } else {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const trackNavigation = (label: string, href?: string) => {
    if (href) {
      navigate(href);
      setActiveDropdown(null);
    }
  };

  const handleNavItemClick = (item: NavItem) => {
    if (item.children) {
      setActiveDropdown(activeDropdown === item.label ? null : item.label);
    } else if (item.href) {
      trackNavigation(item.label, item.href);
    }
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-slate-900/95 backdrop-blur-md shadow-lg shadow-slate-900/10"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 lg:px-8">
          {/* Main Nav Row */}
          <div className="flex items-center justify-between h-16 lg:h-[70px]">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group transition-all duration-200" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="rounded-xl p-1.5 transition-all duration-300 group-hover:bg-white/10 group-hover:scale-105">
                <img src="/interq-logo.png" alt="InterQ" className="h-9 lg:h-10 w-auto" loading="lazy" decoding="async" />
              </div>
              <span className="text-xl lg:text-2xl font-bold tracking-tight transition-colors duration-300 text-white group-hover:text-cyan-300">
                InterQ
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1" ref={dropdownRef}>
              {navigationItems.map((item) => (
                <div key={item.label} className="relative">
                  <button
                    onClick={() => handleNavItemClick(item)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive(item.href) || item.children?.some(child => isActive(child.href))
                        ? "bg-white/10 text-white"
                        : "text-white/90 hover:text-white hover:bg-white/5"
                    }`}
                    aria-expanded={activeDropdown === item.label}
                    aria-haspopup={item.children ? "true" : "false"}
                  >
                    {item.label}
                    {item.children && (
                      <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === item.label ? "rotate-180" : ""}`} />
                    )}
                  </button>

                  {/* Enhanced Dropdown */}
                  {item.children && (
                    <AnimatePresence>
                      {activeDropdown === item.label && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.96 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl shadow-slate-900/15 border border-slate-100 overflow-hidden dropdown-menu"
                        >
                          <div className="p-2">
                            {item.children.map((child) => (
                              <button
                                key={child.label}
                                onClick={() => trackNavigation(child.label, child.href)}
                                className={`w-full flex items-center gap-3 p-3.5 text-left rounded-xl transition-all duration-200 group/item ${
                                  isActive(child.href) 
                                    ? "bg-gradient-to-r from-cyan-50 to-cyan-50/50 text-cyan-600" 
                                    : "text-slate-700 hover:bg-slate-50 hover:text-cyan-600"
                                }`}
                              >
                                {child.icon && (
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                                    isActive(child.href) 
                                      ? "bg-cyan-500 text-white" 
                                      : "bg-slate-100 text-slate-500 group-hover/item:bg-cyan-100 group-hover/item:text-cyan-600"
                                  }`}>
                                    <child.icon size={18} />
                                  </div>
                                )}
                                <div className="flex-1">
                                  <div className="font-semibold text-sm">{child.label}</div>
                                  {child.description && <div className="text-xs text-slate-500 mt-0.5">{child.description}</div>}
                                </div>
                                <ChevronRight size={16} className={`text-slate-300 transition-transform group-hover/item:translate-x-1 ${
                                  isActive(child.href) ? "text-cyan-400" : ""
                                }`} />
                              </button>
                            ))}
                          </div>
                          {/* Decorative gradient */}
                          <div className="h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}

              {isAdmin && (
                <Link
                  to="/admin"
                  className={`ml-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive("/admin") ? "bg-white/10 text-white" : "text-white/90 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Admin
                </Link>
              )}
            </nav>

            {/* Desktop Auth Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-2">
                  <Link to="/settings">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="font-medium nav-btn-ghost"
                    >
                      <Settings size={16} className="mr-1.5" /> Settings
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={signOut} 
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 font-medium"
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/auth">
                      <Button 
                      variant="ghost" 
                      size="sm" 
                      className="font-semibold nav-btn-ghost text-white"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/get-started">
                    <Button 
                      size="sm" 
                      className="font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/40 transition-all duration-200 hover:-translate-y-0.5"
                    >
                      Book Demo
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2.5 rounded-xl border-2 transition-all duration-200 nav-mobile-btn`}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[40] lg:hidden"
                style={{ top: "70px" }}
              />
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="lg:hidden bg-white border-b border-slate-100 shadow-2xl overflow-hidden fixed left-0 right-0 z-50 mobile-menu"
                style={{ top: "70px" }}
              >
                <div className="container mx-auto px-4 py-6 space-y-2 max-h-[calc(100vh-70px)] overflow-y-auto">
                  {/* Nav Items */}
                  <div className="space-y-1">
                    {navigationItems.map((item) => (
                      <div key={item.label} className="space-y-1">
                        <button
                          onClick={() => handleNavItemClick(item)}
                          className={`w-full flex items-center justify-between p-4 text-left rounded-xl font-semibold transition-all duration-200 ${
                            isActive(item.href) || item.children?.some(child => isActive(child.href))
                              ? "bg-gradient-to-r from-cyan-50 to-cyan-50/50 text-cyan-600"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <span>{item.label}</span>
                          {item.children && (
                            <ChevronDown size={20} className={`transition-transform duration-200 ${activeDropdown === item.label ? "rotate-180" : ""}`} />
                          )}
                        </button>
                        {item.children && activeDropdown === item.label && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }} 
                            animate={{ opacity: 1, height: "auto" }} 
                            exit={{ opacity: 0, height: 0 }}
                            className="pl-4 space-y-1"
                          >
                            {item.children.map((child) => (
                              <button
                                key={child.label}
                                onClick={() => trackNavigation(child.label, child.href)}
                                className={`w-full flex items-center gap-3 p-3.5 text-left rounded-xl transition-colors ${
                                  isActive(child.href) ? "bg-cyan-50 text-cyan-600" : "text-slate-600 hover:bg-slate-50"
                                }`}
                              >
                                {child.icon && <child.icon size={18} className="text-cyan-500" />}
                                <div>
                                  <div className="font-semibold text-sm">{child.label}</div>
                                  {child.description && <div className="text-xs text-slate-500 mt-0.5">{child.description}</div>}
                                </div>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </div>

                  {isAdmin && (
                    <Link 
                      to="/admin" 
                      onClick={() => setIsMobileMenuOpen(false)} 
                      className={`block p-4 rounded-xl font-semibold transition-colors ${
                        isActive("/admin") ? "bg-cyan-50 text-cyan-600" : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      Admin Dashboard
                    </Link>
                  )}

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-4" />

                  {/* Auth Buttons */}
                  <div className="space-y-3 pb-4">
                    {user ? (
                      <div className="space-y-2">
                        <Link to="/settings" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button variant="outline" size="lg" className="w-full justify-start border-slate-200 text-slate-700 hover:border-cyan-300 hover:text-cyan-600 hover:bg-cyan-50">
                            <Settings size={18} className="mr-2" /> Settings
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="lg" 
                          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 font-medium" 
                          onClick={() => { signOut(); setIsMobileMenuOpen(false); }}
                        >
                          Sign Out
                        </Button>
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button variant="outline" size="lg" className="w-full justify-center font-semibold border-2 border-slate-200 text-white hover:border-cyan-300 hover:text-white hover:bg-gray-800">
                            Sign In
                          </Button>
                        </Link>
                        <Link to="/get-started" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button size="lg" className="w-full justify-center font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg">
                            Book Demo
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
};

export default EnhancedNavigation;
