"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardSidebar({ 
  displayName, 
  planName 
}: { 
  displayName: string, 
  planName: string 
}) {
  const pathname = usePathname();

  const navLinks = [
    { href: '/dashboard', label: 'Overview' },
    { href: '/dashboard/purchases', label: 'My Purchases' },
    { href: '/dashboard/reading-list', label: 'Reading List' },
    { href: '/dashboard/memberships', label: 'Active Memberships' },
    { href: '/dashboard/wishlist', label: 'Wishlist' },
    { href: '/dashboard/settings', label: 'Account Settings' },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col justify-between min-h-screen">
      <div>
        <div className="flex items-center gap-3 p-6">
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800" />
          <div>
            <p className="font-medium text-primary-navy dark:text-white">{displayName}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{planName}</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 px-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-4 py-3 text-sm font-medium ${
                  isActive 
                    ? 'bg-primary-navy text-white' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>
      </div>

      <form action="/api/signout" method="POST" className="p-4">
        <button
          type="submit"
          className="w-full text-left text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-3 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          Sign Out
        </button>
      </form>
    </aside>
  );
}