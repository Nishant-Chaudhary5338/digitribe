export default function Loading() {
  return (
    <div
      className="flex min-h-[70vh] items-center justify-center bg-[#0a0e27]"
      aria-label="Loading"
      role="status"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#ff5b3a"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-8 w-8 animate-spin"
        aria-hidden="true"
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
      <span className="sr-only">Loading</span>
    </div>
  )
}
