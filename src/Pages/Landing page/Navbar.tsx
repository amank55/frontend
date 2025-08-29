import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import YourLogo from "@/assets/38881995.png"; // Update this import path to your logo

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  onClick?: () => void;
  isScrollLink?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({
  to,
  children,
  onClick,
  isScrollLink = false,
}) => {
  // Handle scroll to section
  const handleClick = (e: React.MouseEvent) => {
    if (isScrollLink) {
      e.preventDefault();

      // Remove the # from the target
      const targetId = to.replace("#", "");
      const element = document.getElementById(targetId);

      if (element) {
        // Scroll to the element with smooth behavior
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }

      // Call additional onClick handler if provided
      if (onClick) onClick();
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <Link
      to={to}
      onClick={handleClick}
      className="text-gray-700 dark:text-gray-300 text-lg font-medium 
      hover:text-black dark:hover:text-white 
      relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0
      after:bg-gradient-to-r after:from-yellow-500 after:to-green-500
      hover:after:w-full after:transition-all after:duration-300
      transition duration-300"
    >
      {children}
    </Link>
  );
};

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on client side before accessing localStorage
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load dark mode setting - Fixed for mobile compatibility
  useEffect(() => {
    if (!isClient) return;

    const initializeDarkMode = () => {
      try {
        // Check current document state first (most reliable)
        const isDark = document.documentElement.classList.contains('dark');
        if (isDark) {
          setDarkMode(true);
          return;
        }

        // Check if localStorage is available (some mobile browsers restrict it)
        if (typeof Storage !== 'undefined' && window.localStorage) {
          const savedDarkMode = localStorage.getItem("darkMode");
          if (savedDarkMode !== null) {
            const savedIsDark = savedDarkMode === "true";
            setDarkMode(savedIsDark);
            applyDarkMode(savedIsDark);
            return;
          }
        }
        
        // Fallback to system preference
        const prefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setDarkMode(prefersDarkMode);
        applyDarkMode(prefersDarkMode);
      } catch (error) {
        console.warn("Error loading dark mode:", error);
        // Safe fallback
        setDarkMode(false);
        applyDarkMode(false);
      }
    };

    initializeDarkMode();
  }, [isClient]);

  // Enhanced function to apply dark mode changes with better mobile support
  const applyDarkMode = (isDark: boolean) => {
    try {
      const html = document.documentElement;
      const body = document.body;

      // Apply dark mode class
      if (isDark) {
        html.classList.add("dark");
        html.setAttribute("data-theme", "dark");
        body.classList.add("dark");
      } else {
        html.classList.remove("dark");
        html.setAttribute("data-theme", "light");
        body.classList.remove("dark");
      }

      // Set color scheme for mobile browsers
      html.style.colorScheme = isDark ? "dark" : "light";
      
      // Force background color change for mobile - more aggressive approach
      body.style.backgroundColor = isDark ? "#000000" : "#ffffff";
      body.style.color = isDark ? "#ffffff" : "#000000";

      // Additional CSS properties for mobile compatibility
      html.style.backgroundColor = isDark ? "#000000" : "#ffffff";
      
      // Force theme-color meta update for mobile browsers
      const themeColorMeta = document.querySelector('meta[name="theme-color"]');
      if (themeColorMeta) {
        themeColorMeta.setAttribute('content', isDark ? '#000000' : '#ffffff');
      } else {
        // Create theme-color meta if it doesn't exist
        const meta = document.createElement('meta');
        meta.name = 'theme-color';
        meta.content = isDark ? '#000000' : '#ffffff';
        document.head.appendChild(meta);
      }

      // Save to localStorage if available
      if (typeof Storage !== 'undefined' && window.localStorage) {
        try {
          localStorage.setItem("darkMode", isDark.toString());
        } catch (e) {
          console.warn("Cannot save to localStorage:", e);
        }
      }

      // Enhanced mobile repaint logic - more aggressive for Android
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isAndroid = /Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Multiple repaint strategies for different mobile browsers
        const forceRepaint = () => {
          // Strategy 1: Transform trick
          html.style.transform = 'translateZ(0)';
          html.style.backfaceVisibility = 'hidden';
          
          requestAnimationFrame(() => {
            html.style.transform = '';
            html.style.backfaceVisibility = '';
            
            // Strategy 2: Display trick
            const originalDisplay = html.style.display;
            html.style.display = 'none';
            html.offsetHeight; // Force reflow
            html.style.display = originalDisplay;
            
            // Strategy 3: Force style recalculation
            const temp = html.offsetHeight;
            void temp; // Use the variable to prevent optimization
          });
        };

        // Immediate repaint
        forceRepaint();
        
        // Android-specific: Additional delayed repaints
        if (isAndroid) {
          setTimeout(forceRepaint, 50);
          setTimeout(forceRepaint, 150);
          setTimeout(() => {
            // Final force update for stubborn Android browsers
            document.body.style.display = 'none';
            document.body.offsetHeight;
            document.body.style.display = '';
          }, 300);
        }
      }

      // Dispatch custom event for other components
      window.dispatchEvent(new CustomEvent('themeChanged', { 
        detail: { darkMode: isDark } 
      }));

      console.log('Theme applied:', isDark ? 'dark' : 'light'); // Debug log

    } catch (error) {
      console.error("Error applying dark mode:", error);
    }
  };

  // Enhanced dark mode toggle with mobile-specific handling
  const toggleDarkMode = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const newDarkMode = !darkMode;
    
    // Immediate state update
    setDarkMode(newDarkMode);
    
    // Apply changes immediately with multiple strategies
    requestAnimationFrame(() => {
      applyDarkMode(newDarkMode);
    });

    // Mobile-specific: Additional delayed update
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      setTimeout(() => {
        applyDarkMode(newDarkMode);
      }, 100);
    }

    console.log('Theme toggled to:', newDarkMode ? 'dark' : 'light'); // Debug log
  };

  // Handle scroll to adjust navbar styles
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Add viewport meta tag check for mobile
  useEffect(() => {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, user-scalable=yes';
      document.getElementsByTagName('head')[0].appendChild(meta);
    }
  }, []);

  return (
    <>
      <nav
        className={`fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl z-50 
        transition-all duration-300 ease-in-out 
        bg-white/70 dark:bg-black/50 backdrop-blur-md 
        rounded-3xl overflow-hidden
        ${scrolled ? "shadow-lg shadow-gray-300/50 dark:shadow-black/40" : "shadow-none"}
        ${scrolled ? "w-[90%]" : "w-[95%]"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center">
              <div className="mr-4">
                <Link to="/">
                  <img
                    src={YourLogo}
                    alt="PictoPy Logo"
                    className="w-10 h-10 object-contain"
                  />
                </Link>
              </div>

              {/* Tooltip on hover */}
              <div className="relative group">
                <Link
                  to="/"
                  className="text-2xl font-bold 
                  bg-gradient-to-r from-yellow-500 to-green-500 
                  bg-clip-text text-transparent
                  hover:from-green-600 hover:to-yellow-600 
                  transition-colors duration-300"
                >
                  PictoPy
                </Link>

                {/* Custom Tooltip with Gradient */}
                <div
                  className="absolute left-1/2 transform -translate-x-1/2 bottom-12 hidden group-hover:block 
                  bg-gradient-to-r from-yellow-500 to-green-500 text-white text-sm px-2 py-1 rounded-md shadow-md"
                >
                  Ready to sort images
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <NavLink to="/">Home</NavLink>

              {/* Desktop Dark Mode Toggle Button */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full text-gray-800 dark:text-gray-300 
                hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800
                transition-all duration-300 touch-manipulation"
                type="button"
                aria-label="Toggle dark mode"
              >
                <span className="text-xl">
                  {darkMode ? "🌙" : "🌞"}
                </span>
              </button>
            </div>

            {/* Mobile menu button and theme toggle */}
            <div className="md:hidden flex items-center space-x-2">
              {/* Mobile Dark Mode Toggle - Improved */}
              <button
                onClick={toggleDarkMode}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  toggleDarkMode();
                }}
                className="p-3 rounded-full text-gray-800 dark:text-gray-300 
                hover:text-black dark:hover:text-white 
                bg-white/80 dark:bg-black/80 backdrop-blur-sm
                hover:bg-white dark:hover:bg-gray-800
                border border-gray-200 dark:border-gray-700
                shadow-sm hover:shadow-md
                transition-all duration-200 touch-manipulation
                active:scale-95 active:bg-gray-100 dark:active:bg-gray-700
                select-none cursor-pointer"
                type="button"
                aria-label="Toggle dark mode"
                style={{ 
                  WebkitTapHighlightColor: 'transparent',
                  WebkitTouchCallout: 'none',
                  WebkitUserSelect: 'none',
                  minWidth: '48px',
                  minHeight: '48px',
                  fontSize: '20px'
                }}
              >
                <span className="text-xl block pointer-events-none">
                  {darkMode ? "🌙" : "🌞"}
                </span>
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-3 rounded-full text-gray-800 dark:text-gray-300 
                hover:text-black dark:hover:text-white
                bg-white/80 dark:bg-black/80 backdrop-blur-sm
                hover:bg-white dark:hover:bg-gray-800
                border border-gray-200 dark:border-gray-700
                shadow-sm hover:shadow-md
                transition-all duration-300 touch-manipulation
                active:scale-95"
                type="button"
                aria-label="Toggle menu"
                style={{ 
                  WebkitTapHighlightColor: 'transparent',
                  minWidth: '48px',
                  minHeight: '48px'
                }}
              >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden fixed inset-0 z-50 
          bg-white dark:bg-black
          transform transition-transform duration-300 ease-in-out 
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="pt-16 pb-6 px-4 space-y-6">
            <div className="space-y-4 flex flex-col items-start">
              <NavLink to="/" onClick={() => setIsOpen(false)}>
                Home
              </NavLink>
              <NavLink to="#features" isScrollLink={true} onClick={() => setIsOpen(false)}>
                Feature
              </NavLink>
              <NavLink to="#about" isScrollLink={true} onClick={() => setIsOpen(false)}>
                About
              </NavLink>
              
              {/* Mobile menu theme toggle */}
              <div className="w-full pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={toggleDarkMode}
                  className="w-full flex items-center justify-between p-4 rounded-lg
                  text-gray-800 dark:text-gray-300 hover:text-black dark:hover:text-white
                  hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300
                  touch-manipulation active:scale-95"
                  type="button"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <span className="text-lg font-medium">Theme</span>
                  <span className="text-2xl">{darkMode ? "🌙" : "🌞"}</span>
                </button>
              </div>

              <Button
                className="w-full bg-gray-800 dark:bg-black 
                text-white 
                hover:bg-green-700 dark:hover:bg-green-800 
                transition-colors duration-300 mt-4"
                onClick={() => setIsOpen(false)}
              >
                Download
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Overlay for mobile menu */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;