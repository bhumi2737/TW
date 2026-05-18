import { GOOGLE_AUTH_URL } from '../lib/api';

function GoogleAuthButton({ label = 'Continue with Google' }) {
  return (
    <a
      href={GOOGLE_AUTH_URL}
      className="flex w-full items-center justify-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/10"
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#EA4335"
          d="M12 10.2v3.6h5.1c-.2 1.2-1.5 3.6-5.1 3.6-3.1 0-5.6-2.6-5.6-5.8S8.9 5.8 12 5.8c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.8 3.4 14.6 2.4 12 2.4 6.9 2.4 2.7 6.6 2.7 11.7S6.9 21 12 21c6.9 0 8.5-4.8 8.5-7.3V10.2H12z"
        />
        <path
          fill="#34A853"
          d="M3.3 7.5 6.5 9.9C7.4 7.8 9.5 6.2 12 6.2c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.8 3.4 14.6 2.4 12 2.4 8.5 2.4 5.6 4.7 4.5 7.9l-1.2-.4z"
          opacity="0"
        />
        <path
          fill="#4285F4"
          d="M12 21c3.1 0 5.7-1 7.6-2.7l-3.6-2.8c-1 .7-2.3 1.2-4 1.2-3.1 0-5.6-2.6-5.6-5.8 0-.8.2-1.6.5-2.3L3.3 7.5C2.4 9.2 2 10.9 2 12.6c0 5.1 4.2 8.4 10 8.4z"
        />
        <path
          fill="#FBBC05"
          d="M20.1 12.3c0-.5 0-1-.1-1.5H12v3h4.6c-.2 1-1 2.4-2.5 3.2l3.9 3c2.3-2.1 3.6-5.2 3.6-8.7z"
        />
      </svg>
      {label}
    </a>
  );
}

export default GoogleAuthButton;
