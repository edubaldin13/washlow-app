import { useState } from 'react';

interface EvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (evidenceImageBase64: string) => void;
  machineName: string;
  isLoading?: boolean;
}

export function EvidenceModal({ isOpen, onClose, onConfirm, machineName, isLoading = false }: EvidenceModalProps) {
  const [evidenceImageBase64, setEvidenceImageBase64] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setEvidenceImageBase64(result);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    if (!evidenceImageBase64) {
      setError('Selecione uma imagem de evidência.');
      return;
    }

    onConfirm(evidenceImageBase64);
  };

  const handleClose = () => {
    if (isLoading) return;
    setEvidenceImageBase64('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm max-h-[90vh] overflow-y-auto p-5 sm:p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Encerrar lavagem</h3>
        <p className="text-slate-600 mb-4">
          Adicione uma foto de evidência mostrando onde a roupa foi deixada após retirar da máquina "{machineName}".
        </p>

        <div className="space-y-4">
          <div>
            <label htmlFor="evidence-image" className="block text-sm font-medium text-slate-700 mb-1">
              Foto de evidência
            </label>
            <input
              id="evidence-image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
              disabled={isLoading}
            />
            {evidenceImageBase64 && (
              <div className="mt-3 w-full h-40 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                <img src={evidenceImageBase64} alt="Evidência" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {error && <div className="text-rose-600 text-sm bg-rose-50 px-3 py-2 rounded-md">{error}</div>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Encerrando...' : 'Encerrar lavagem'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
