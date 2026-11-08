import React from 'react';
import { X, ArrowDownRight, ArrowUpRight, RefreshCw, History, Trash2 } from 'lucide-react';
import { StockMovement } from '../types/product';

interface StockHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  movements: StockMovement[];
  onClearHistory: () => void;
}

export const StockHistoryModal: React.FC<StockHistoryModalProps> = ({
  isOpen,
  onClose,
  movements,
  onClearHistory
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="hist-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 id="hist-title" className="text-base font-bold text-slate-900">
                Histórico de Movimentações de Estoque
              </h2>
              <p className="text-xs text-slate-500">
                Registro de auditoria de entradas, saídas e balanços
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {movements.length > 0 && (
              <button
                type="button"
                onClick={onClearHistory}
                aria-label="Limpar histórico"
                className="text-xs text-rose-600 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 flex items-center gap-1 transition-colors"
                title="Limpar todos os registros de histórico"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Limpar Registro</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-slate-100">
          {movements.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-600">Nenhuma movimentação registrada</p>
              <p className="text-xs text-slate-400 mt-1">
                As alterações de quantidade e estoque realizadas aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {movements.map(m => {
                const dateFormatted = new Date(m.data).toLocaleString('pt-BR');
                const isEntrada = m.tipo === 'ENTRADA';
                const isSaida = m.tipo === 'SAIDA';

                return (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          isEntrada
                            ? 'bg-emerald-100 text-emerald-700'
                            : isSaida
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-indigo-100 text-indigo-700'
                        }`}
                      >
                        {isEntrada ? (
                          <ArrowUpRight className="w-5 h-5" />
                        ) : isSaida ? (
                          <ArrowDownRight className="w-5 h-5" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono-code font-bold text-xs text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                            {m.codigoProduto}
                          </span>
                          <span className="text-sm font-bold text-slate-800 truncate">
                            {m.descricaoProduto}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                          <span>Motivo: <strong className="text-slate-700">{m.motivo}</strong></span>
                          <span>•</span>
                          <span>{dateFormatted}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                      <span
                        className={`text-sm font-extrabold ${
                          isEntrada
                            ? 'text-emerald-600'
                            : isSaida
                            ? 'text-rose-600'
                            : 'text-indigo-600'
                        }`}
                      >
                        {isEntrada ? `+${m.quantidade}` : isSaida ? `-${m.quantidade}` : `Ajuste`}
                      </span>
                      <span className="text-xs text-slate-400 font-mono-code">
                        {m.quantidadeAnterior} → {m.quantidadeNova}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
