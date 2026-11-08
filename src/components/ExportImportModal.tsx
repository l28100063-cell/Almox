import React, { useState, useRef } from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Product } from '../types/product';
import { exportProductsToCSV, parseCSVToProducts } from '../utils/inventory';
import { INITIAL_PRODUCTS } from '../utils/seedData';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onImportProducts: (newProducts: Partial<Product>[]) => void;
  onRestoreDefaults: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  products,
  onImportProducts,
  onRestoreDefaults
}) => {
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadCSV = () => {
    try {
      const csvContent = exportProductsToCSV(products);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `produtos_estoquefacil_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setFeedback({ type: 'success', message: 'Planilha CSV exportada com sucesso!' });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao gerar arquivo CSV.' });
    }
  };

  const handleDownloadJSON = () => {
    try {
      const jsonContent = JSON.stringify(products, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `backup_estoque_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setFeedback({ type: 'success', message: 'Backup JSON baixado com sucesso!' });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao baixar backup JSON.' });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const text = event.target?.result as string;
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            onImportProducts(parsed);
            setFeedback({ type: 'success', message: `${parsed.length} produtos importados do backup JSON!` });
          } else {
            throw new Error('Formato JSON inválido.');
          }
        } else {
          // CSV import
          const items = parseCSVToProducts(text);
          if (items.length > 0) {
            onImportProducts(items);
            setFeedback({ type: 'success', message: `${items.length} produtos importados da planilha CSV!` });
          } else {
            setFeedback({ type: 'error', message: 'Nenhum registro válido encontrado no CSV.' });
          }
        }
      } catch (err: any) {
        setFeedback({ type: 'error', message: err.message || 'Erro ao processar arquivo.' });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="exp-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 id="exp-title" className="text-base font-bold text-slate-900">
                Importar e Exportar Planilhas
              </h2>
              <p className="text-xs text-slate-500">
                Compatível com Microsoft Excel, LibreOffice e Google Planilhas
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Feedback message */}
          {feedback && (
            <div
              className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Export Options */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Exportar Estoque Atual
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleDownloadCSV}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-colors flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Planilha CSV</span>
                  <span className="text-[10px] text-slate-500">Para Excel (.csv)</span>
                </div>
              </button>

              <button
                type="button"
                onClick={handleDownloadJSON}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-colors flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Backup JSON</span>
                  <span className="text-[10px] text-slate-500">Dados integrais</span>
                </div>
              </button>
            </div>
          </div>

          {/* Import Section */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Importar Produtos
            </h3>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 px-4 rounded-xl border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 hover:bg-indigo-50 text-indigo-900 transition-colors flex flex-col items-center justify-center gap-2 text-center"
            >
              <Upload className="w-6 h-6 text-indigo-600" />
              <div>
                <span className="text-xs font-bold text-indigo-900 block">
                  Clique para selecionar arquivo .CSV ou .JSON
                </span>
                <span className="text-[11px] text-slate-500">
                  Código, Descrição, Código de Barras e Quantidade
                </span>
              </div>
            </button>
          </div>

          {/* Restore Defaults */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Precisa recarregar os exemplos iniciais?
            </span>
            <button
              type="button"
              onClick={() => {
                onRestoreDefaults();
                setFeedback({ type: 'success', message: 'Produtos de demonstração restaurados!' });
              }}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Demonstração</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
