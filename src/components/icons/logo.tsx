export function Logo() {
  return (
    <div className="bg-primary rounded-lg w-8 h-8 flex justify-center items-center">
      <svg
        className="w-5 h-5 text-primary-foreground"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 10V3L4 14h7v7l9-11h-7z"
        ></path>
      </svg>
    </div>
  );
}
