type Props<T> = {
  status: "loading" | "error" | "success";
  data?: T[];
  pesanKosong?: string;
  pesanError?: string;
  onRetry?: () => void;
  children: (data: T[]) => React.ReactNode;
};

export function DataState<T>({
  status,
  data,
  pesanKosong = "Belum ada data",
  pesanError = "Gagal memuat data",
  onRetry,
  children,
}: Props<T>) {
  if (status === "loading")
    return (
      <p role="status" className="p-6 text-center">
        Memuat...
      </p>
    );

  if (status === "error")
    return (
      <div role="alert" className="rounded border border-red-300 bg-red-50 p-4">
        <p className="text-red-700">{pesanError}</p>
        {onRetry && (
          <button onClick={onRetry} className="mt-2 text-red-700 underline">
            Coba lagi
          </button>
        )}
      </div>
    );

  if (!data?.length)
    return <p className="p-6 text-center text-gray-500">{pesanKosong}</p>;

  return <>{children(data)}</>;
}