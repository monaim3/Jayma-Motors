"use client";

import "./globals.css";

/** Last-resort boundary: renders its own <html> because the root layout failed. */
export default function GlobalError({ retry }) {
  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-zinc-600">Please try again. If the problem continues, call us at 01711-949110.</p>
        <button
          type="button"
          onClick={() => retry()}
          className="mt-6 rounded-control bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
