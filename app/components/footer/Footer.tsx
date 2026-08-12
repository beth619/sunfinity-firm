import Link from 'next/link';
import NewsletterForm from '@/app/components/Newsletter/NewsletterForm';

export default function Footer() {
  return (
    <footer className="bg-primary-navy text-white py-16 px-6 border-t border-gray-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* Brand Column */}
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-bold">SunFinity Firm</h3>
          <p className="text-sm text-gray-300">
            Books, Essays and frameworks for Builders.
          </p>
          <div className="flex gap-4 mt-2">
            {/* Social links */}
          </div>
        </div>

        {/* Explore */}
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Explore</h4>
          <Link href="/books" className="text-sm text-gray-300 hover:text-white transition-colors">Books</Link>
          <Link href="/articles" className="text-sm text-gray-300 hover:text-white transition-colors">Articles</Link>
          <Link href="/courses" className="text-sm text-gray-300 hover:text-white transition-colors">Courses</Link>
        </div>

        {/* Company */}
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Company</h4>
          <Link href="/about" className="text-sm text-gray-300 hover:text-white transition-colors">About</Link>
          <Link href="/resources" className="text-sm text-gray-300 hover:text-white transition-colors">Resources</Link>
          <Link href="/privacy" className="text-sm text-gray-300 hover:text-white transition-colors">Privacy</Link>
        </div>

        {/* Newsletter Column with Whiten Input Style */}
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Newsletter</h4>
          <p className="text-xs text-gray-300">
            Get the latest updates directly in your inbox.
          </p>
          <NewsletterForm
            variant="dark"
            inputClassName="bg-white text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-green"
            buttonClassName="bg-primary-green text-white rounded-lg px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity"
          />
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400">
        <p>&copy; 2026 SunFinity Firm. All rights reserved</p>
        <div className="flex gap-6 mt-4 sm:mt-0">
          <Link href="/terms" className="hover:text-white">Terms</Link>
          <Link href="/privacy" className="hover:text-white">Privacy</Link>
          <Link href="/cookies" className="hover:text-white">Cookies</Link>
        </div>
      </div>
    </footer>
  );
}