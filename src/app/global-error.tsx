"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center p-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Critical Error</h1>
            <p className="text-muted-foreground">
              The application encountered a critical error. Please refresh the page.
            </p>
          </div>
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Refresh page
          </button>
        </div>
      </body>
    </html>
  );
}
