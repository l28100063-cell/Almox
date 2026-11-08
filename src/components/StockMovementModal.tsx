import React, { useState } from 'react';
import { X, ArrowDownRight, ArrowUpRight, RefreshCw, Check } from 'lucide-react';
import { Product, MovementType } from '../types/product';

interface StockMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onConfirm: (
    productId: string,
    tipo: MovementType,
    delta: number,
    motivo: string
  ) => void;
}

export const StockMovementModal: React.FC<StockMovementModalProps> = ({
  isOpen,
  onClose,
  product,
  onConfirm
}) => {
  if (!isOpen || !product) return null;

  const [tipo, setTipo] = useState<MovementType>('ENTRADA');
  const [delta, setDelta] = useState<number>(1);
  const [motivo, setMotivo] = useState('Compra de Fornecedor / Reposição');

  const currentQty = product.quantidade;
  let newQty = currentQty;

  if (tipo === 'ENTRADA') {
    newQty = currentQty + (delta || 0);
  } else if (tipo === 'SAIDA') {
    newQty = Math.max(0, currentQty - (delta || 0));
  } else {
    // AJUSTE: direct set
    newQty = Math.max(0, delta || 0);
  }

  const defaultReasons: { [key in MovementType]: string[] } = {
    ENTRADA: [
      'Compra de Fornecedor / Reposição',
      'Devolução de Cliente',
      'Transferência entre Lojas',
      'Bonificação'
    ],
    SAIDA: [
      'Venda Balcão / Checkout',
      'Quebra / Avaria / Vencimento',
      'Uso Interno / Consumo',
      'Devolução ao Fornecedor'
    ],
    AJUSTE: [
      'Contagem de Inventário Periódico',
      'Correção de Lançamento Anterior',
      'Auditoria Fiscal'
    ]
  };

  const handleTypeChange = (newType: MovementType) => {
    setTipo(newType);
    setMotivo(defaultReasons[newType][0] || '');
    if (newType === 'AJUSTE') {
      setDelta(currentQty);
    } else {
      setDelta(1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (delta <= 0 && tipo !== 'AJUSTE') return;

    onConfirm(
      product.id,
      tipo,
      tipo === 'AJUSTE' ? delta - currentQty : delta,
      motivo
    );
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mov-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div>
            <h2 id="mov-title" className="text-base font-bold text-slate-900">
              Movimentar Estoque
            </h2>
            <p className="text-xs text-slate-500 font-mono-code">
              {product.codigo} - {product.descricao}
            </p>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Movement Type Tabs */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => handleTypeChange('ENTRADA')}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
                tipo === 'ENTRADA'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              Entrada (+)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('SAIDA')}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
                tipo === 'SAIDA'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              Saída (-)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('AJUSTE')}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
                tipo === 'AJUSTE'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Balanço
            </button>
          </div>

          {/* Current vs New Quantity Preview Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-around text-center">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Atual
              </span>
              <span className="text-xl font-bold text-slate-700">
                {currentQty} {product.unidade}
              </span>
            </div>
            <div className="text-slate-300 font-bold text-xl">→</div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Novo Estoque
              </span>
              <span className={`text-2xl font-black ${
                newQty <= 0
                  ? 'text-rose-600'
                  : 'text-emerald-600'
              }`}>
                {newQty} {product.unidade || 'UN'}
              </span>
            </div>
          </div>

          {/* Quantity Input */}
          <div>
            <label htmlFor="mov-qtd" className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              {tipo === 'AJUSTE' ? 'Nova Quantidade Absoluta' : 'Quantidade da Operação'}
            </label>
            <input
              id="mov-qtd"
              type="number"
              min={tipo === 'AJUSTE' ? 0 : 1}
              step="1"
              value={delta}
              onChange={e => setDelta(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-lg text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
            />

            {/* Quick Increment Buttons */}
            {tipo !== 'AJUSTE' && (
              <div className="flex gap-2 mt-2">
                {[1, 5, 10, 25, 50].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setDelta(val)}
                    className="flex-1 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors border border-slate-200"
                  >
                    +{val}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reason Selection */}
          <div>
            <label htmlFor="mov-motivo" className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Motivo da Movimentação
            </label>
            <select
              id="mov-motivo"
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all mb-2"
            >
              {defaultReasons[tipo].map(r => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
              <option value="Outro">Outro (especificar)</option>
            </select>
            {motivo === 'Outro' && (
              <input
                type="text"
                placeholder="Descreva o motivo"
                onChange={e => setMotivo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-sm transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Confirmar Movimentação</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
