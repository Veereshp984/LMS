export default function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`rounded-md bg-[#0a4dcf] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#083da5] disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
