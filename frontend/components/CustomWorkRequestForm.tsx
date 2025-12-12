'use client';

import { useState } from 'react';
import { CustomWorkRequest } from '@/lib/types';

interface CustomWorkRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomWorkRequestForm({
  isOpen,
  onClose,
}: CustomWorkRequestFormProps) {
  const [formData, setFormData] = useState<CustomWorkRequest>({
    name: '',
    email: '',
    phone: '',
    description: '',
    budget: '',
    timeline: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/custom-work-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to submit request');

      setSubmitStatus('success');
      setTimeout(() => {
        onClose();
        setFormData({
          name: '',
          email: '',
          phone: '',
          description: '',
          budget: '',
          timeline: '',
        });
        setSubmitStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Error submitting request:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-lg bg-gray-900 p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Request Custom Work</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            aria-label="Close"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <p className="mb-4 text-gray-300">
          Interested in commissioning a custom piece? Tell me about your vision!
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-300">
              Name *
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-300">
              Email *
            </label>
            <input
              type="email"
              id="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
            />
          </div>

          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-300">
              Phone (optional)
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
            />
          </div>

          <div>
            <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-300">
              Project Description *
            </label>
            <textarea
              id="description"
              rows={4}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
              placeholder="Describe what you'd like me to create..."
            />
          </div>

          <div>
            <label htmlFor="budget" className="mb-1 block text-sm font-medium text-gray-300">
              Budget (optional)
            </label>
            <input
              type="text"
              id="budget"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
              placeholder="e.g., $100-200"
            />
          </div>

          <div>
            <label htmlFor="timeline" className="mb-1 block text-sm font-medium text-gray-300">
              Timeline (optional)
            </label>
            <input
              type="text"
              id="timeline"
              value={formData.timeline}
              onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
              placeholder="e.g., 2-3 weeks"
            />
          </div>

          {submitStatus === 'success' && (
            <div className="rounded-lg bg-green-900/50 p-3 text-green-300">
              Request sent! I'll review your project and get back to you soon.
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="rounded-lg bg-red-900/50 p-3 text-red-300">
              Something went wrong. Please try again.
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-700 px-4 py-2 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-pink-600 px-4 py-2 font-semibold text-white hover:bg-pink-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
