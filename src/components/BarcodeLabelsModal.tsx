import React, { useState } from 'react';
import { X, Printer } from 'lucide-react';
import { Product } from '../types/product';
import { BarcodeDisplay } from './BarcodeDisplay';

interface BarcodeLabelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  initialSelectedProductId?: string;
}

export const BarcodeLabelsModal: React.FC<BarcodeLabelsModalProps> = ({
  isOpen,
  onClose,
  products,
  initialSelectedProductId
}) => {
  if (!isOpen) return null;

  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialSelectedProductId || 'ALL'
  );
  const [copiesPerProduct, setCopiesPerProduct] = useState<number>(2);
  const [useCurrentStockQty, setUseCurrentStockQty] = useState(false);
  const [showDescription, setShowDescription] = useState(true);
  const [columns, setColumns] = useState<number>(3); // 2, 3 or 4 columns

  // Filter products to print
  const productsToPrint = selectedProductId === 'ALL'
    ? products
    : products.filter(p => p.id === selectedProductId);

  // Generate label items list based on copy count or stock count
  const labelsToRender: { product: Product; key: string }[] = [];
  for (const product of productsToPrint) {
    const count = useCurrentStockQty ? Math.max(1, product.quantidade) : copiesPerProduct;
    for (let i = 0; i < count; i++) {
      labelsToRender.push({
        product,
        key: `${product.id}-${i}`
      });
    }
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="labels-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header - Hidden when printing */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 no-print">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 id="labels-title" className="text-base font-bold text-slate-900">
                Gerador de Etiquetas de Código de Barras
              </h2>
              <p className="text-xs text-slate-500">
                Pronto para impressão em folha A4 adesiva Pimaco / Maxprint ou rolo térmico
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

        {/* Configuration Toolbar - Hidden when printing */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 no-print space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Product selection */}
            <div>
              <label htmlFor="label-product-select" className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Produto
              </label>
              <select
                id="label-product-select"
                value={selectedProductId}
                onChange={e => setSelectedProductId(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">Todos os Produtos ({products.length})</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.codigo} - {p.descricao}
                  </option>
                ))}
              </select>
            </div>

            {/* Copies per item */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Cópias por Item
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={copiesPerProduct}
                  disabled={useCurrentStockQty}
                  onChange={e => setCopiesPerProduct(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 disabled:opacity-40"
                />
                <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useCurrentStockQty}
                    onChange={e => setUseCurrentStockQty(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Qtd do Estoque</span>
                </label>
              </div>
            </div>

            {/* Layout columns */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Colunas por Folha
              </label>
              <div className="flex gap-1.5">
                {[2, 3, 4].map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColumns(c)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                      columns === c
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {c} Colunas
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/60">
            <div className="flex items-center gap-4 text-xs font-medium text-slate-700">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showDescription}
                  onChange={e => setShowDescription(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Exibir Descrição</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">
                Total: <strong>{labelsToRender.length}</strong> etiqueta{labelsToRender.length !== 1 ? 's' : ''}
              </span>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Etiquetas</span>
              </button>
            </div>
          </div>
        </div>

        {/* Printable Labels Canvas Sheet */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-200/50 print:bg-white print:p-0">
          <div
            className={`grid gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs print:border-none print:shadow-none print:p-0 ${
              columns === 2
                ? 'grid-cols-2'
                : columns === 3
                ? 'grid-cols-3'
                : 'grid-cols-4'
            }`}
          >
            {labelsToRender.map(({ product, key }) => (
              <div
                key={key}
                className="border border-dashed border-slate-300 rounded-lg p-2.5 flex flex-col items-center justify-between text-center bg-white break-inside-avoid print:border-solid print:border-slate-400"
                style={{ minHeight: '120px' }}
              >
                {/* Header: Código Interno */}
                <div className="w-full flex items-center justify-center text-[11px] font-bold text-slate-600 pb-1 border-b border-slate-100">
                  <span className="font-mono-code text-indigo-700">{product.codigo}</span>
                </div>

                {/* Description */}
                {showDescription && (
                  <p className="text-[11px] font-bold text-slate-900 line-clamp-2 my-1 leading-tight">
                    {product.descricao}
                  </p>
                )}

                {/* Barcode SVG */}
                <div className="w-full my-1 flex justify-center">
                  <BarcodeDisplay
                    value={product.codigoBarras}
                    height={36}
                    showText={true}
                    className="border-none shadow-none p-0 max-w-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
