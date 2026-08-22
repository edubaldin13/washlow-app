import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ServiceService,
  ServiceStatus,
  type ServiceDetailResponse,
  type ServiceHistoryResponse,
} from '../services/ServiceService';
import { ToastService } from '../services/ToastService';
import { getUser, isAdmin, type StoredUser } from '../utils/userCookie';
import { EditMachineModal } from '../components/EditMachineModal';
import { EvidenceModal } from '../components/EvidenceModal';

interface MachineDetailPageProps {
  serviceService: ServiceService;
}

export function MachineDetailPage({ serviceService }: MachineDetailPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<ServiceDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);
  const [selectedEvidenceImage, setSelectedEvidenceImage] = useState<string | null>(null);
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const loadService = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError('');
      const data = await serviceService.getServiceDetail(Number(id));
      setService(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar máquina');
    } finally {
      setLoading(false);
    }
  }, [id, serviceService]);

  useEffect(() => {
    loadService();
  }, [loadService]);

  const handleStartWash = async () => {
    if (!service || !user) return;

    setIsUpdating(true);
    try {
      await serviceService.updateService(service.id, {
        status: ServiceStatus.Using,
        userId: user.id,
      });
      await loadService();
      ToastService.success('Lavagem iniciada com sucesso!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao iniciar lavagem';
      ToastService.error(message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenEndWash = () => {
    setIsEvidenceOpen(true);
  };

  const handleEndWash = async (evidenceImageBase64: string) => {
    if (!service || !user) return;

    setIsUpdating(true);
    try {
      await serviceService.updateService(service.id, {
        status: ServiceStatus.Free,
        userId: user.id,
        evidenceImageBase64,
      });
      await loadService();
      setIsEvidenceOpen(false);
      ToastService.success('Lavagem encerrada com sucesso!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao encerrar lavagem';
      ToastService.error(message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAdminUpdate = async (name: string, imageBase64: string) => {
    if (!service || !user) return;

    setIsUpdating(true);
    try {
      await serviceService.adminUpdateService(service.id, {
        name,
        imageBase64,
        userId: user.id,
      });
      await loadService();
      setIsEditing(false);
      ToastService.success('Máquina atualizada com sucesso!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar máquina';
      ToastService.error(message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendWhatsApp = (phone: string | undefined) => {
    if (!phone) {
      ToastService.error('Não foi possível encontrar o telefone do usuário.');
      return;
    }

    const formattedPhone = formatWhatsAppPhone(phone);
    const text = encodeURIComponent(
      'Olá, espero que esteja bem!\n\nSua roupa está lavada! :D'
    );
    const url = `https://api.whatsapp.com/send/?phone=${formattedPhone}&text=${text}&type=phone_number&app_absent=0`;

    window.open(url, '_blank');
  };

  const formatWhatsAppPhone = (phone: string): string => {
    const digits = phone.replace(/\D/g, '');

    if (digits.startsWith('55') && digits.length >= 12) {
      return digits;
    }

    if (digits.length === 11 || digits.length === 10) {
      return `55${digits}`;
    }

    return digits;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const getStatusBadge = (status: ServiceStatus) => {
    const isUsing = status === ServiceStatus.Using;
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          isUsing ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
        }`}
      >
        {isUsing ? 'Em uso' : 'Disponível'}
      </span>
    );
  };

  const renderHistoryItem = (history: ServiceHistoryResponse) => {
    const isCompleted = history.endedAt !== undefined && history.endedAt !== null;

    return (
      <div
        key={history.id}
        className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col gap-3"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm text-slate-700">
              <span className="font-medium">Iniciado por:</span> {history.startedByUserName}
            </p>
            {isCompleted && history.endedByUserName && (
              <p className="text-sm text-slate-700">
                <span className="font-medium">Encerrado por:</span> {history.endedByUserName}
              </p>
            )}
          </div>
          <div className="text-sm text-slate-500 space-y-1 sm:text-right">
            <p>Início: {formatDate(history.startedAt)}</p>
            {isCompleted && <p>Fim: {formatDate(history.endedAt)}</p>}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {history.evidenceImageBase64 && (
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-300 shadow-sm shrink-0">
                <img
                  src={
                    history.evidenceImageBase64.startsWith('data:')
                      ? history.evidenceImageBase64
                      : `data:image/png;base64,${history.evidenceImageBase64}`
                  }
                  alt="Evidência"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvidenceImage(history.evidenceImageBase64)}
                className="text-sm font-medium text-sky-600 hover:text-sky-700 transition-colors"
              >
                Ver evidência
              </button>
            </div>
          )}

          {history.startedByUserPhone && (
            <button
              type="button"
              onClick={() => handleSendWhatsApp(history.startedByUserPhone)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors"
              aria-label="Enviar mensagem no WhatsApp"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Mensagem
            </button>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500">Carregando máquina...</div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
        <div className="text-rose-600 mb-4">{error || 'Máquina não encontrada.'}</div>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
        >
          Voltar
        </button>
      </div>
    );
  }

  const isUsing = service.status === ServiceStatus.Using;
  const admin = isAdmin(user);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-sky-600 text-white shadow-md">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="p-2 rounded-md hover:bg-sky-700 transition-colors"
              aria-label="Voltar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold">Detalhes da Máquina</h1>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shadow-inner shrink-0">
              {service.imageBase64 ? (
                <img
                  src={
                    service.imageBase64.startsWith('data:')
                      ? service.imageBase64
                      : `data:image/png;base64,${service.imageBase64}`
                  }
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-semibold text-slate-800 mb-2">{service.name}</h2>
              <div className="mb-4">{getStatusBadge(service.status)}</div>
              <p className="text-sm text-slate-500">
                Cadastrada em{' '}
                {new Intl.DateTimeFormat('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                }).format(new Date(service.createdAt))}
              </p>
            </div>

            <div className="flex flex-col w-full sm:w-auto gap-3">
              {admin && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  disabled={isUpdating}
                  className="w-full sm:w-auto px-6 py-3 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Editar máquina
                </button>
              )}

              {isUsing ? (
                <button
                  type="button"
                  onClick={handleOpenEndWash}
                  disabled={isUpdating || !user}
                  className="w-full sm:w-auto px-6 py-3 bg-rose-600 text-white font-medium rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Encerrar lavagem
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartWash}
                  disabled={isUpdating || !user}
                  className="w-full sm:w-auto px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Iniciar lavagem
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Histórico de uso</h3>

          {service.history.length === 0 ? (
            <div className="text-slate-500 text-center py-8">Nenhum histórico de uso registrado.</div>
          ) : (
            <div className="space-y-3">{service.history.map(renderHistoryItem)}</div>
          )}
        </div>
      </main>

      <EditMachineModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onSave={handleAdminUpdate}
        initialName={service.name}
        initialImageBase64={service.imageBase64}
        isLoading={isUpdating}
      />

      <EvidenceModal
        isOpen={isEvidenceOpen}
        onClose={() => setIsEvidenceOpen(false)}
        onConfirm={handleEndWash}
        machineName={service.name}
        isLoading={isUpdating}
      />

      {selectedEvidenceImage && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 px-4 py-6"
          onClick={() => setSelectedEvidenceImage(null)}
        >
          <div className="relative w-full max-w-3xl max-h-[90vh]">
            <button
              type="button"
              onClick={() => setSelectedEvidenceImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-slate-300 transition-colors"
              aria-label="Fechar"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={
                selectedEvidenceImage.startsWith('data:')
                  ? selectedEvidenceImage
                  : `data:image/png;base64,${selectedEvidenceImage}`
              }
              alt="Evidência ampliada"
              className="w-full h-full max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
