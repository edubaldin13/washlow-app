import { useState } from 'react';
import { isAdmin, type StoredUser } from '../utils/userCookie';

interface LayoutProps {
  children: React.ReactNode;
  user: StoredUser | null;
  onLogout: () => void;
}

export function Layout({ children, user, onLogout }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-sky-600 text-white shadow-md">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md hover:bg-sky-700 transition-colors"
              aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold">WashFlow</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-sm opacity-90">
              {user?.name} {isAdmin(user) && '(Admin)'}
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="p-2 rounded-md hover:bg-sky-700 transition-colors"
              aria-label="Sair"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside
          className={`bg-white border-r border-slate-200 shadow-sm transition-all duration-300 ${
            isMenuOpen ? 'w-64' : 'w-0 overflow-hidden'
          }`}
        >
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <a
                  href="/"
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-slate-700 hover:bg-slate-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Máquinas
                </a>
              </li>
            </ul>
          </nav>
        </aside>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
