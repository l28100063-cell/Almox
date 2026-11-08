import React from 'react';
import { Package, Boxes, CheckCircle2 } from 'lucide-react';

interface DashboardStatsProps {
  totalProducts: number;
  totalItems: number;
  outOfStockCount: number;
  inStockCount: number;
  onFilterInStock: () => void;
  onFilterOutOfStock: () => void;
  onResetFilters: () => void;
  selectedStatus: string;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalProducts,
  totalItems,
  outOfStockCount,
  inStockCount,
  onFilterInStock,
  onFilterOutOfStock,
  onResetFilters,
  selectedStatus
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 no-print">
      {/* Total Products */}
      <div
        onClick={onResetFilters}
        className={`bg-white rounded-xl p-4 sm:p-5 border transition-all cursor-pointer hover:shadow-md ${
          selectedStatus === 'TODOS'
            ? 'border-indigo-300 ring-2 ring-indigo-50 shadow-xs'
            : 'border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total de Produtos
            </p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              {totalProducts}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {totalItems} unidade{totalItems !== 1 ? 's' : ''} no inventário
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* In Stock */}
      <div
        onClick={onFilterInStock}
        className={`bg-white rounded-xl p-4 sm:p-5 border transition-all cursor-pointer hover:shadow-md ${
          selectedStatus === 'EM_ESTOQUE'
            ? 'border-emerald-300 ring-2 ring-emerald-50 shadow-xs'
            : 'border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Disponíveis
            </p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">
              {inStockCount}
            </h3>
            <p className="text-xs text-emerald-700/80 mt-1">
              Com saldo em estoque
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Out of Stock Warning */}
      <div
        onClick={onFilterOutOfStock}
        className={`bg-white rounded-xl p-4 sm:p-5 border transition-all cursor-pointer hover:shadow-md ${
          selectedStatus === 'ESGOTADO'
            ? 'border-rose-400 ring-2 ring-rose-100 shadow-xs'
            : 'border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-rose-700 uppercase tracking-wider">
              Esgotados
            </p>
            <h3 className="text-2xl font-extrabold text-rose-600 mt-1">
              {outOfStockCount}
            </h3>
            <p className="text-xs text-rose-700/80 mt-1">
              {outOfStockCount > 0 ? 'Itens com estoque zerado' : 'Nenhum item zerado'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Boxes className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
};
