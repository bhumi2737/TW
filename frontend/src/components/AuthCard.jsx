import Navbar from './Navbar';

function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 text-white">
      <Navbar />
      <main className="mx-auto flex max-w-md flex-col px-6 py-12">
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-8 shadow-xl backdrop-blur">
          <h1 className="text-2xl font-semibold">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-sm text-white/70">{subtitle}</p>
          )}
          <div className="mt-6">{children}</div>
          {footer && (
            <div className="mt-6 text-center text-sm text-white/70">{footer}</div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AuthCard;
