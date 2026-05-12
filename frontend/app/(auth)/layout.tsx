export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-brand-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-brand-700">Tulip+</h1>
          <p className="mt-2 text-sm text-gray-500">Welcome to your dashboard</p>
        </div>
        <div className="card p-8">{children}</div>
      </div>
    </div>
  );
}
