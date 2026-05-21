export default function LoadingSpinner({ size = 'md' }) {
  const sizes = { sm: 'h-6 w-6', md: 'h-10 w-10', lg: 'h-14 w-14' };
  return (
    <div className="flex flex-col justify-center items-center py-16 gap-4">
      <div className="relative">
        <div className={`${sizes[size]} rounded-full border-2 border-brand-100 dark:border-brand-950`} />
        <div className={`${sizes[size]} rounded-full border-2 border-transparent border-t-brand-500 animate-spin absolute inset-0`} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse-slow" />
        </div>
      </div>
      <p className="text-xs text-gray-400 dark:text-slate-500 animate-pulse-slow tracking-wide">Loading…</p>
    </div>
  );
}
