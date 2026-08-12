'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
    { title: "Home", href: "/" },
    { title: "Books", href: "/books" },
    { title: "Resources", href: "/resources" },
    { title: "Articles", href: "/articles" },
    { title: "Courses", href: "/courses" },
];

export default function NavLinks({ vertical = false, onNavigate }: { vertical?: boolean; onNavigate?: () => void }) {
    const pathname = usePathname();
    return (
        <nav className={vertical ? "flex flex-col gap-4" : "flex items-center gap-6"}>
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={onNavigate}
                        className={isActive ? "font-medium text-primary-green" : "font-light text-gray-500 dark:text-gray-400"}
                    >
                        {item.title}
                    </Link>
                );
            })}
        </nav>
    );
}