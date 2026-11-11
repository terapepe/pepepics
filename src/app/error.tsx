"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-x grid min-h-[60vh] place-items-center py-20 text-center">
      <div>
        <h1 className="h-display text-4xl md:text-6xl">SOMETHING WENT WRONG.</h1>
        <p className="mx-auto mt-4 max-w-md text-mute">We couldn&apos;t load this page. Please try again.</p>
        <button onClick={reset} className="btn-primary mt-8">Try again</button>
      </div>
    </div>
  );
}
