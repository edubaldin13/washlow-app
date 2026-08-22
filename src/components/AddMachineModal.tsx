import { useState } from 'react';

interface AddMachineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, imageBase64: string) => void;
  isLoading?: boolean;
}

export function AddMachineModal({ isOpen, onClose, onSave, isLoading = false }: AddMachineModalProps) {
  const [name, setName] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImageBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Informe o nome da máquina.');
      return;
    }

    onSave(name.trim(), imageBase64);
  };

  const handleClose = () => {
    if (isLoading) return;
    setName('');
    setImageBase64('');
    setError('');
    onClose();
  };

  const inputClassName =
    'w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-base';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm max-h-[90vh] overflow-y-auto p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Adicionar máquina</h3>
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-60"
            aria-label="Fechar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="machine-name" className="block text-sm font-medium text-slate-700 mb-1">
              Nome da máquina
            </label>
            <input
              id="machine-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Máquina 01"
              className={inputClassName}
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="machine-image" className="block text-sm font-medium text-slate-700 mb-1">
              Imagem
            </label>
            <input
              id="machine-image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
              disabled={isLoading}
            />
            {imageBase64 && (
              <div className="mt-3 w-20 h-20 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                <img src={imageBase64} alt="Preview" className="w-full h-full object-cover" />
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
  );
}
