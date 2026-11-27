import Link from "next/link";

export default function NotFound() {
  return (
    <main className="site flex min-h-screen flex-col items-start justify-center px-4 sm:px-8">
      <div className="mx-auto w-full max-w-[75rem]">
        <p className="eyebrow mb-4">Error 404</p>
        <h1 className="display-pixel">Not found</h1>
        <p className="lede mt-6">This page does not exist. It may have been moved or unpublished.</p>
        <Link href="/" className="btn btn-primary mt-8">
          Back to home
        </Link>
      </div>
    </main>
  );
}
