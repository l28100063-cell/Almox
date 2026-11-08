import React from 'react';
import {
  Package,
  Plus,
  Barcode,
  Printer,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react';

interface HeaderProps {
  onNewProduct: () => void;
  onOpenScanner: () => void;
  onOpenLabels: () => void;
  onOpenExportImport: () => void;
  outOfStockCount: number;
  totalProducts: number;
}

export const Header: React.FC<HeaderProps> = ({
  onNewProduct,
  onOpenScanner,
  onOpenLabels,
  onOpenExportImport,
  outOfStockCount,
  totalProducts
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 shrink-0">
              <Package className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 truncate">
                  Estoque<span className="text-indigo-600">Fácil</span>
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  v2.5
                </span>
                {outOfStockCount > 0 && (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 animate-pulse"
                    title={`${outOfStockCount} produto(s) com estoque zerado`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>{outOfStockCount} esgotado{outOfStockCount > 1 ? 's' : ''}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 truncate hidden sm:block">
                Cadastro e Gestão de Produtos com Código de Barras
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Scanner / Bip button */}
            <button
              type="button"
              onClick={onOpenScanner}
              aria-label="Leitor de Código de Barras"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-lg transition-colors border border-slate-200"
              title="Ler código de barras via câmera ou leitor óptico"
            >
              <Barcode className="w-4 h-4 text-indigo-600" />
              <span className="hidden md:inline">Bipar Código</span>
            </button>

            {/* Print Labels button */}
            <button
              type="button"
              onClick={onOpenLabels}
              aria-label="Imprimir Etiquetas"
              disabled={totalProducts === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-lg transition-colors border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Gerar e imprimir folhas de etiquetas de código de barras"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span className="hidden md:inline">Etiquetas</span>
            </button>

            {/* Export / Import button */}
            <button
              type="button"
              onClick={onOpenExportImport}
              aria-label="Importar e Exportar Planilhas"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-lg transition-colors border border-slate-200"
              title="Exportar ou importar planilha CSV / Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="hidden lg:inline">Planilha / CSV</span>
            </button>

            {/* Primary New Product Button */}
            <button
              type="button"
              onClick={onNewProduct}
              aria-label="Cadastrar Novo Produto"
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm shadow-indigo-300 transition-all hover:shadow hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Novo Produto</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
