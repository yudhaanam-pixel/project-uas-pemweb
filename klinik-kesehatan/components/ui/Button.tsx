type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
};

const gaya = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  secondary: "border bg-white text-gray-900 hover:bg-gray-50",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

export function Button({ variant = "primary", loading, children, disabled, ...rest }: Props) {
  return (
    <button
      disabled={disabled || loading}
      className={`rounded px-4 py-2 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 ${gaya[variant]}`}
      {...rest}
    >
      {loading ? "Memproses..." : children}
    </button>
  );
}