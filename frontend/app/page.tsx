'use client';

import Link from 'next/link';
import { useState } from 'react';
import CustomWorkRequestForm from '@/components/CustomWorkRequestForm';

export default function Home() {
  const [isCustomWorkFormOpen, setIsCustomWorkFormOpen] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-900 to-black">
      <main className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h1 className="mb-6 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-6xl font-bold text-transparent md:text-8xl">
          VelvetGraphite
        </h1>
        <p className="mb-4 text-xl text-gray-300 md:text-2xl">
          Art Gallery
        </p>
        <p className="mb-12 text-lg text-gray-400">
          A curated collection of artwork by VelvetGraphite
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/gallery"
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-pink-600 to-purple-600 px-8 py-4 text-lg font-medium text-white transition-all hover:from-pink-500 hover:to-purple-500"
          >
            <span className="relative flex items-center">
              View Gallery
              <svg
                className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </span>
          </Link>
          <button
            onClick={() => setIsCustomWorkFormOpen(true)}
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-full border-2 border-pink-600 px-8 py-4 text-lg font-medium text-pink-400 transition-all hover:bg-pink-600/10"
          >
            Request Custom Work
          </button>
        </div>

        <CustomWorkRequestForm
          isOpen={isCustomWorkFormOpen}
          onClose={() => setIsCustomWorkFormOpen(false)}
        />


      </main>
    </div>
  );
}
