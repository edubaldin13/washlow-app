import { useCallback, useEffect, useState } from 'react';
import { UserService, type UserResponse } from '../services/UserService';
import { ToastService } from '../services/ToastService';
import { saveUser, type StoredUser } from '../utils/userCookie';

interface ProfilePageProps {
  userService: UserService;
  user: StoredUser | null;
  onUserUpdated: (user: StoredUser) => void;
}

export function ProfilePage({ userService, user, onUserUpdated }: ProfilePageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const loadUser = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError('');

    try {
      const apiUser: UserResponse = await userService.getUserById(user.id);
      setFormData({
        name: apiUser.name,
        email: apiUser.email,
        phone: apiUser.phone,
        address: apiUser.address,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados do perfil');
    } finally {
      setIsLoading(false);
    }
  }, [user, userService]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!user) return;

    const { name, email, phone, address } = formData;

    if (!name.trim() || !email.trim() || !phone.trim() || !address.trim()) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }

    if (!email.includes('@')) {
      setError('Informe um email válido.');
      return;
    }

    setIsSaving(true);

    try {
      const updatedUser = await userService.updateUser(user.id, {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });

      const storedUser: StoredUser = {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        role: updatedUser.role,
      };

      saveUser(storedUser);
      onUserUpdated(storedUser);
      ToastService.success('Perfil atualizado com sucesso!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar perfil';
      setError(message);
      ToastService.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const inputClassName =
    'w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-base';

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">Editar Perfil</h2>

      {isLoading && <div className="text-slate-500">Carregando dados do perfil...</div>}

      {!isLoading && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5">
          <div>
            <label htmlFor="profile-name" className="block text-sm font-medium text-slate-700 mb-1">
              Nome
            </label>
            <input
              id="profile-name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Seu nome completo"
              className={inputClassName}
              disabled={isSaving}
            />
          </div>

          <div>
            <label htmlFor="profile-email" className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              id="profile-email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="seu@email.com"
              className={inputClassName}
              disabled={isSaving}
            />
          </div>

          <div>
            <label htmlFor="profile-phone" className="block text-sm font-medium text-slate-700 mb-1">
              Telefone
            </label>
            <input
              id="profile-phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="(00) 00000-0000"
              className={inputClassName}
              disabled={isSaving}
            />
          </div>

          <div>
            <label htmlFor="profile-address" className="block text-sm font-medium text-slate-700 mb-1">
              Endereço
            </label>
            <input
              id="profile-address"
              type="text"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Ex: Rua das Flores, 123"
              className={inputClassName}
              disabled={isSaving}
            />
          </div>

          {error && (
            <div className="text-rose-600 text-sm bg-rose-50 px-3 py-2 rounded-md">{error}</div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
