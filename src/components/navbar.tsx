"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#e63946] to-[#c1121f] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="text-xl font-bold text-gray-900">
              Nepali<span className="text-[#e63946]">oripari</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/news/politics">Politics</NavLink>
            <NavLink href="/news/sports">Sports</NavLink>
            <NavLink href="/news/technology">Technology</NavLink>
            <NavLink href="/news/entertainment">Entertainment</NavLink>
            <NavLink href="/news/business">Business</NavLink>
            <NavLink href="/polls">Polls</NavLink>
          </div>

          <div className="hidden md:flex items-center space-x-3">
            {session ? (
              <div className="flex items-center space-x-3">
                {session.user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="bg-gradient-to-r from-[#e63946] to-[#c1121f] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:shadow-md"
                  >
                    Admin
                  </Link>
                )}
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-full">
                  <div className="w-6 h-6 bg-[#457b9d] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {session.user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-gray-700 font-medium">
                    {session.user.name}
                  </span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="text-sm text-gray-500 hover:text-[#e63946] font-medium px-3 py-1.5 rounded-lg hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-[#e63946] font-medium text-sm px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-[#e63946] to-[#c1121f] text-white px-5 py-2 rounded-lg text-sm font-medium shadow-sm hover:shadow-md"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-5 h-5 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <div className="md:hidden pb-4 pt-2 space-y-1 border-t border-gray-100 mt-2">
            <MobileNavLink href="/" onClick={() => setMenuOpen(false)}>Home</MobileNavLink>
            <MobileNavLink href="/news/politics" onClick={() => setMenuOpen(false)}>Politics</MobileNavLink>
            <MobileNavLink href="/news/sports" onClick={() => setMenuOpen(false)}>Sports</MobileNavLink>
            <MobileNavLink href="/news/technology" onClick={() => setMenuOpen(false)}>Technology</MobileNavLink>
            <MobileNavLink href="/news/entertainment" onClick={() => setMenuOpen(false)}>Entertainment</MobileNavLink>
            <MobileNavLink href="/news/business" onClick={() => setMenuOpen(false)}>Business</MobileNavLink>
            <MobileNavLink href="/polls" onClick={() => setMenuOpen(false)}>Polls</MobileNavLink>
            <hr className="my-2 border-gray-100" />
            {session ? (
              <>
                {session.user.role === "ADMIN" && (
                  <MobileNavLink href="/admin" onClick={() => setMenuOpen(false)}>
                    🎛️ Admin Dashboard
                  </MobileNavLink>
                )}
                <button
                  onClick={() => {
                    signOut();
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 px-3 text-gray-500 hover:text-[#e63946] rounded-lg hover:bg-red-50 text-sm"
                >
                  Logout ({session.user.name})
                </button>
              </>
            ) : (
              <>
                <MobileNavLink href="/login" onClick={() => setMenuOpen(false)}>Login</MobileNavLink>
                <MobileNavLink href="/register" onClick={() => setMenuOpen(false)}>Sign Up</MobileNavLink>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-gray-600 hover:text-[#e63946] font-medium text-sm px-3 py-2 rounded-lg hover:bg-red-50/50"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="block py-2 px-3 text-gray-700 hover:text-[#e63946] rounded-lg hover:bg-red-50/50 text-sm font-medium"
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
