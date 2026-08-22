import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ServiceService, type ServiceResponse, ServiceStatus } from '../services/ServiceService';
import { AddMachineModal } from '../components/AddMachineModal';
import { ToastService } from '../services/ToastService';
import { isAdmin, type StoredUser } from '../utils/userCookie';

interface MachinesPageProps {
  serviceService: ServiceService;
  user: StoredUser | null;
}

export function MachinesPage({ serviceService, user }: MachinesPageProps) {
  const navigate = useNavigate();
  const [machines, setMachines] = useState<ServiceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadMachines = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await serviceService.getServices();
      setMachines(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar máquinas');
    } finally {
      setLoading(false);
    }
  }, [serviceService]);

  useEffect(() => {
    loadMachines();
  }, [loadMachines]);

  const handleAddMachine = async (name: string, imageBase64: string) => {
    setIsSaving(true);
    try {
      await serviceService.createService({ name, imageBase64 });
      await loadMachines();
      setIsAddModalOpen(false);
      ToastService.success('Máquina adicionada com sucesso!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao adicionar máquina';
      ToastService.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const admin = isAdmin(user);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <h2 className="text-2xl font-semibold text-slate-800">Máquinas</h2>
        <div className="flex gap-3">
          {admin && (
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Adicionar
            </button>
          )}
          <button
            type="button"
            onClick={loadMachines}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Atualizar
          </button>
        </div>
      </div>

      {loading && <div className="text-slate-500">Carregando máquinas...</div>}

      {error && (
        <div className="mb-4 p-4 bg-rose-50 text-rose-700 rounded-lg border border-rose-200">
          {error}
        </div>
      )}

      {!loading && machines.length === 0 && (
        <div className="text-slate-500">Nenhuma máquina cadastrada.</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {machines.map((machine) => (
          <div
            key={machine.id}
            onClick={() => navigate(`/machines/${machine.id}`)}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col items-center text-center cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 mb-4 border border-slate-200 shadow-inner">
              {machine.imageBase64 ? (
                <img
                  src={machine.imageBase64.startsWith('data:') ? machine.imageBase64 : `data:image/png;base64,${machine.imageBase64}`}
                  alt={machine.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
              )}
            </div>

            <h3 className="text-lg font-semibold text-slate-800 mb-1">{machine.name}</h3>

            <div className="flex items-center gap-2 mb-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  machine.status === ServiceStatus.Using
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {machine.status === ServiceStatus.Using ? 'Em uso' : 'Disponível'}
              </span>
            </div>
          </div>
        ))}
      </div>

      <AddMachineModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddMachine}
        isLoading={isSaving}
      />
    </div>
  );
}
