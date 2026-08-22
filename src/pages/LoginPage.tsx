import { useEffect, useState } from 'react';

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface LoginPageProps {
  onLogin: (email: string) => void;
  onRegister: (data: RegisterData) => void;
  isLoading?: boolean;
}

export const REMEMBERED_EMAIL_KEY = 'washflow_remembered_email';

export function LoginPage({ onLogin, onRegister, isLoading = false }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [rememberEmail, setRememberEmail] = useState(false);
  const [error, setError] = useState('');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const [registerData, setRegisterData] = useState<RegisterData>({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [registerError, setRegisterError] = useState('');

  useEffect(() => {
    const rememberedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY);
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberEmail(true);
    }
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Preencha o email.');
      return;
    }

    if (!email.includes('@')) {
      setError('Informe um email válido.');
      return;
    }

    const trimmedEmail = email.trim();

    if (rememberEmail) {
      localStorage.setItem(REMEMBERED_EMAIL_KEY, trimmedEmail);
    } else {
      localStorage.removeItem(REMEMBERED_EMAIL_KEY);
    }

    onLogin(trimmedEmail);
  };

  const handleRememberChange = (checked: boolean) => {
    setRememberEmail(checked);
    if (!checked) {
      localStorage.removeItem(REMEMBERED_EMAIL_KEY);
    }
  };

  const handleRegisterChange = (field: keyof RegisterData, value: string) => {
    setRegisterData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegisterSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setRegisterError('');

    const { name, email: registerEmail, phone, address } = registerData;

    if (!name.trim() || !registerEmail.trim() || !phone.trim() || !address.trim()) {
      setRegisterError('Preencha todos os campos obrigatórios.');
      return;
    }

    if (!registerEmail.includes('@')) {
      setRegisterError('Informe um email válido.');
      return;
    }

    onRegister({
      name: name.trim(),
      email: registerEmail.trim(),
      phone: phone.trim(),
      address: address.trim(),
    });
  };

  const inputClassName =
    'w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-base';

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-6">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-sky-100 text-sky-600 mb-3 sm:mb-4">
            <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">WashFlow</h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">Acesse para gerenciar as lavagens</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className={inputClassName}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="remember-email"
              type="checkbox"
              checked={rememberEmail}
              onChange={(e) => handleRememberChange(e.target.checked)}
              className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
              disabled={isLoading}
            />
            <label htmlFor="remember-email" className="text-sm text-slate-600 select-none">
              Lembrar email
            </label>
          </div>

          {error && <div className="text-rose-600 text-sm bg-rose-50 px-3 py-2 rounded-md">{error}</div>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-sky-600 text-white font-medium py-3 rounded-lg hover:bg-sky-700 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500 mb-3">Ainda não tem conta?</p>
          <button
            type="button"
            onClick={() => setIsRegisterOpen(true)}
            disabled={isLoading}
            className="w-full border border-sky-600 text-sky-600 font-medium py-3 rounded-lg hover:bg-sky-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Registrar
          </button>
        </div>
      </div>

      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm max-h-[90vh] overflow-y-auto p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Criar conta</h3>
              <button
                type="button"
                onClick={() => setIsRegisterOpen(false)}
                disabled={isLoading}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Fechar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label htmlFor="register-name" className="block text-sm font-medium text-slate-700 mb-1">
                  Nome
                </label>
                <input
                  id="register-name"
                  type="text"
                  value={registerData.name}
                  onChange={(e) => handleRegisterChange('name', e.target.value)}
                  placeholder="Seu nome completo"
                  className={inputClassName}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="register-email" className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  id="register-email"
                  type="email"
                  value={registerData.email}
                  onChange={(e) => handleRegisterChange('email', e.target.value)}
                  placeholder="seu@email.com"
                  className={inputClassName}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="register-phone" className="block text-sm font-medium text-slate-700 mb-1">
                  Telefone
                </label>
                <input
                  id="register-phone"
                  type="tel"
                  value={registerData.phone}
                  onChange={(e) => handleRegisterChange('phone', e.target.value)}
                  placeholder="(00) 00000-0000"
                  className={inputClassName}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="register-address" className="block text-sm font-medium text-slate-700 mb-1">
                  Endereço
                </label>
                <input
                  id="register-address"
                  type="text"
                  value={registerData.address}
                  onChange={(e) => handleRegisterChange('address', e.target.value)}
                  placeholder="Ex: Rua das Flores, 123"
                  className={inputClassName}
                  disabled={isLoading}
                />
              </div>

              {registerError && (
                <div className="text-rose-600 text-sm bg-rose-50 px-3 py-2 rounded-md">{registerError}</div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-60"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
