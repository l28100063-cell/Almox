import React from 'react';
import {
  Edit2,
  Trash2,
  Printer,
  ArrowUpDown,
  AlertTriangle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Product, SortField, SortOrder } from '../types/product';
import { BarcodeDisplay } from './BarcodeDisplay';
import { getStockStatus } from '../utils/inventory';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string, descricao: string) => void;
  onPrintSingleLabel: (productId: string) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onEdit,
  onDelete,
  onPrintSingleLabel,
  sortField,
  sortOrder,
  onSortChange
}) => {
  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-300 ml-1 inline opacity-0 group-hover:opacity-100 transition-opacity" />;
    }
    return (
      <span className="ml-1 text-xs text-indigo-600 font-bold">
        {sortOrder === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
  };

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800">Nenhum produto encontrado</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          Não encontramos nenhum item correspondente aos filtros atuais. Tente buscar por outro termo ou cadastrar um novo produto.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-600 uppercase tracking-wider select-none">
              <th
                onClick={() => onSortChange('codigo')}
                className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors group"
              >
                <div className="flex items-center">
                  <span>Código Interno</span>
                  {renderSortIndicator('codigo')}
                </div>
              </th>
              <th
                onClick={() => onSortChange('descricao')}
                className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors group"
              >
                <div className="flex items-center">
                  <span>Descrição</span>
                  {renderSortIndicator('descricao')}
                </div>
              </th>
              <th className="py-3.5 px-4 text-center">
                <span>Código de Barras</span>
              </th>
              <th
                onClick={() => onSortChange('quantidade')}
                className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors group text-center"
              >
                <div className="flex items-center justify-center">
                  <span>Quantidade</span>
                  {renderSortIndicator('quantidade')}
                </div>
              </th>
              <th className="py-3.5 px-4 text-center">
                <span>Status</span>
              </th>
              <th className="py-3.5 px-4 text-right">
                <span>Ações</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {products.map(p => {
              const status = getStockStatus(p.quantidade);
              const isOut = status === 'ESGOTADO';

              return (
                <tr
                  key={p.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    isOut ? 'bg-rose-50/25' : ''
                  }`}
                >
                  {/* Código Interno */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-mono-code font-bold text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-md inline-block">
                      {p.codigo}
                    </span>
                  </td>

                  {/* Descrição */}
                  <td className="py-3.5 px-4">
                    <div className="max-w-xs sm:max-w-md">
                      <p
                        className="font-bold text-slate-900 text-sm leading-tight hover:text-indigo-600 cursor-pointer"
                        onClick={() => onEdit(p)}
                        title="Clique para editar"
                      >
                        {p.descricao}
                      </p>
                    </div>
                  </td>

                  {/* Código de barras com SVG visual */}
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <div className="inline-flex flex-col items-center group relative">
                      <BarcodeDisplay
                        value={p.codigoBarras}
                        height={32}
                        showText={true}
                        className="hover:border-indigo-400 cursor-pointer"
                        onClick={() => copyToClipboard(p.codigoBarras)}
                        title="Clique para copiar código de barras"
                      />
                    </div>
                  </td>

                  {/* Quantidade (Somente exibição) */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-center">
                    <span
                      className={`inline-block font-extrabold text-sm px-3 py-1 rounded-lg ${
                        isOut
                          ? 'text-rose-700 bg-rose-50 border border-rose-200'
                          : 'text-slate-900 bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {p.quantidade} <span className="text-[11px] font-medium text-slate-500">{p.unidade || 'UN'}</span>
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-center">
                    {isOut ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        <XCircle className="w-3.5 h-3.5" />
                        Esgotado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Em Estoque
                      </span>
                    )}
                  </td>

                  {/* Ações */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Imprimir etiqueta */}
                      <button
                        type="button"
                        onClick={() => onPrintSingleLabel(p.id)}
                        aria-label={`Imprimir etiquetas de ${p.descricao}`}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        title="Imprimir etiquetas de código de barras"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {/* Editar */}
                      <button
                        type="button"
                        onClick={() => onEdit(p)}
                        aria-label={`Editar ${p.descricao}`}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 transition-colors"
                        title="Editar produto"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Excluir */}
                      <button
                        type="button"
                        onClick={() => onDelete(p.id, p.descricao)}
                        aria-label={`Excluir ${p.descricao}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Excluir produto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
