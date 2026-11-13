import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="label mb-8">Error 404</p>
      <h1 className="display">
        Not <span className="accent-serif">found.</span>
      </h1>
      <p className="lede mx-auto mt-8">This route does not resolve to anything. It may have been moved or unpublished.</p>
      <Link href="/" className="btn btn-primary mt-12">
        Back to home
      </Link>
    </main>
  );
}
