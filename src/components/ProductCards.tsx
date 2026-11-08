import React from 'react';
import {
  Edit2,
  Trash2,
  Printer,
  AlertTriangle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Product } from '../types/product';
import { BarcodeDisplay } from './BarcodeDisplay';
import { getStockStatus } from '../utils/inventory';

interface ProductCardsProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string, descricao: string) => void;
  onPrintSingleLabel: (productId: string) => void;
}

export const ProductCards: React.FC<ProductCardsProps> = ({
  products,
  onEdit,
  onDelete,
  onPrintSingleLabel
}) => {
  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800">Nenhum produto encontrado</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          Tente ajustar os termos de busca ou filtros aplicados.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map(p => {
        const status = getStockStatus(p.quantidade);
        const isOut = status === 'ESGOTADO';

        return (
          <div
            key={p.id}
            className={`bg-white rounded-2xl border transition-all p-5 shadow-xs hover:shadow-md flex flex-col justify-between ${
              isOut
                ? 'border-rose-300 ring-1 ring-rose-100'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div>
              {/* Header: Código Interno & Status */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span
                  title={`Código Interno: ${p.codigo}`}
                  className="font-mono-code font-bold text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded"
                >
                  {p.codigo}
                </span>

                {isOut ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                    <XCircle className="w-3 h-3" />
                    Esgotado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3 h-3" />
                    Em Estoque
                  </span>
                )}
              </div>

              {/* Title / Description */}
              <h4
                onClick={() => onEdit(p)}
                className="font-bold text-slate-900 text-base leading-snug hover:text-indigo-600 cursor-pointer line-clamp-2"
                title="Clique para editar"
              >
                {p.descricao}
              </h4>

              {/* Visual Barcode Display */}
              <div className="my-3.5 flex justify-center bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                <BarcodeDisplay
                  value={p.codigoBarras}
                  height={42}
                  showText={true}
                  className="w-full max-w-[220px]"
                />
              </div>

              {/* Quantity Stat (Somente Leitura) */}
              <div className="pt-2 border-t border-slate-100 mb-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Quantidade em Estoque
                  </span>
                  <span
                    className={`inline-block font-black text-base px-2.5 py-0.5 rounded-lg mt-0.5 ${
                      isOut
                        ? 'text-rose-700 bg-rose-50 border border-rose-200'
                        : 'text-slate-900 bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {p.quantidade} <span className="text-xs font-semibold text-slate-500">{p.unidade || 'UN'}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 text-slate-600">
              <button
                type="button"
                onClick={() => onPrintSingleLabel(p.id)}
                aria-label={`Imprimir etiquetas de ${p.descricao}`}
                className="p-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors border border-slate-200 flex items-center gap-1.5 text-xs font-semibold"
                title="Imprimir etiquetas de código de barras"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>Etiquetas</span>
              </button>

              <button
                type="button"
                onClick={() => onEdit(p)}
                aria-label={`Editar ${p.descricao}`}
                className="p-2 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 transition-colors border border-slate-200 flex items-center gap-1.5 text-xs font-semibold"
                title="Editar produto"
              >
                <Edit2 className="w-4 h-4 text-indigo-600" />
                <span>Editar</span>
              </button>

              <button
                type="button"
                onClick={() => onDelete(p.id, p.descricao)}
                aria-label={`Excluir ${p.descricao}`}
                className="p-2 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-colors border border-slate-200"
                title="Excluir produto"
              >
                <Trash2 className="w-4 h-4 text-rose-500" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
