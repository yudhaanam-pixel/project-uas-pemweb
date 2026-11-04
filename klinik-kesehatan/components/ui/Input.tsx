type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function Input({ label, error, id, ...rest }: Props) {
  const fid = id ?? rest.name;
  return (
    <div className="mb-4">
      <label htmlFor={fid} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      <input
        id={fid}
        aria-invalid={!!error}
        aria-describedby={error ? `${fid}-err` : undefined}
        className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
        {...rest}
      />
      {error && (
        <p id={`${fid}-err`} role="alert" className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}