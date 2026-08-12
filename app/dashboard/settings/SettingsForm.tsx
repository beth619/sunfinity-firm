"use client";
import { useState } from 'react';
import { updateDisplayName } from './actions';

export default function SettingsForm({ initialName }: { initialName: string }) {
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: null, message: '' });

    const formData = new FormData(e.currentTarget);
    const result = await updateDisplayName(formData);

    if (result?.error) {
      setStatus({ type: 'error', message: result.error });
    } else if (result?.success) {
      setStatus({ type: 'success', message: 'Name updated successfully!' });
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md w-full">
      {status.message && (
        <div className={`p-3 rounded-lg text-sm ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {status.message}
        </div>
      )}
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Display Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          defaultValue={initialName}
          maxLength={100}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green outline-none transition-colors"
          placeholder="Your full name"
          disabled={isSubmitting}
        />
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-primary-navy text-white rounded-lg px-6 py-2 text-sm font-medium hover:bg-opacity-90 transition-colors w-max disabled:opacity-70"
      >
        {isSubmitting ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}
