"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-red-600">Error</h1>
      <div className="mb-4 text-red-700">{error.message}</div>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={() => reset()}
      >
        Try Again
      </button>
    </main>
  );
}
