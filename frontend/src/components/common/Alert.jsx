export default function Alert({ children, type = "error" }) {
  const color = type === "error" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700";
  return <div className={`rounded-md px-3 py-2 text-sm ${color}`}>{children}</div>;
}
