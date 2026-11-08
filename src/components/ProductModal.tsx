import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Barcode,
  Save,
  Tag,
  Hash,
  FileText,
  Boxes,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { Product } from '../types/product';
import { BarcodeDisplay } from './BarcodeDisplay';
import { generateRandomEan13, generateProductCode } from '../utils/barcode';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Omit<Product, 'id' | 'dataCriacao' | 'dataAtualizacao'>, id?: string) => void;
  onDelete?: (id: string, descricao: string) => void;
  editingProduct?: Product | null;
  existingCodes: string[];
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingProduct,
  existingCodes
}) => {
  const [codigo, setCodigo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [codigoBarras, setCodigoBarras] = useState('');
  const [quantidade, setQuantidade] = useState<number>(0);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (editingProduct) {
      setCodigo(editingProduct.codigo);
      setDescricao(editingProduct.descricao);
      setCodigoBarras(editingProduct.codigoBarras);
      setQuantidade(editingProduct.quantidade);
      setErrors({});
    } else if (isOpen) {
      const nextCode = generateProductCode(existingCodes);
      const nextBarcode = generateRandomEan13();
      setCodigo(nextCode);
      setDescricao('');
      setCodigoBarras(nextBarcode);
      setQuantidade(1);
      setErrors({});
    }
  }, [editingProduct, isOpen, existingCodes]);

  if (!isOpen) return null;

  const handleGenerateBarcode = () => {
    setCodigoBarras(generateRandomEan13());
  };

  const handleGenerateCode = () => {
    setCodigo(generateProductCode(existingCodes));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!codigo.trim()) {
      newErrors.codigo = 'O código interno é obrigatório.';
    } else {
      const isDuplicate = existingCodes.some(
        c =>
          c.toLowerCase() === codigo.trim().toLowerCase() &&
          (!editingProduct || editingProduct.codigo.toLowerCase() !== codigo.trim().toLowerCase())
      );
      if (isDuplicate) {
        newErrors.codigo = 'Já existe um produto com este código.';
      }
    }

    if (!descricao.trim()) {
      newErrors.descricao = 'A descrição do produto é obrigatória.';
    }

    if (!codigoBarras.trim()) {
      newErrors.codigoBarras = 'O código de barras é obrigatório.';
    }

    if (quantidade < 0 || isNaN(quantidade)) {
      newErrors.quantidade = 'Quantidade não pode ser negativa.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(
      {
        codigo: codigo.trim().toUpperCase(),
        descricao: descricao.trim(),
        codigoBarras: codigoBarras.trim(),
        quantidade: Number(quantidade)
      },
      editingProduct?.id
    );

    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 id="modal-title" className="text-lg font-bold text-slate-900">
                {editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}
              </h2>
              <p className="text-xs text-slate-500">
                Informe código interno, descrição, código de barras e quantidade
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Código Interno & Código de Barras */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Código Interno */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="prod-codigo" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-indigo-600" />
                  Código Interno <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleGenerateCode}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                  title="Gerar código sequencial automático"
                >
                  <Sparkles className="w-3 h-3" />
                  Auto-gerar
                </button>
              </div>
              <input
                id="prod-codigo"
                type="text"
                value={codigo}
                onChange={e => {
                  setCodigo(e.target.value);
                  if (errors.codigo) setErrors({ ...errors, codigo: '' });
                }}
                placeholder="Ex: PRD-0001, 1001"
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl font-mono-code font-bold text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all ${
                  errors.codigo ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              {errors.codigo && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.codigo}
                </p>
              )}
            </div>

            {/* Código de Barras */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="prod-barcode" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Barcode className="w-3.5 h-3.5 text-indigo-600" />
                  Código de Barras <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleGenerateBarcode}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                  title="Gerar código EAN-13 válido aleatório"
                >
                  <Sparkles className="w-3 h-3" />
                  Gerar EAN-13
                </button>
              </div>
              <input
                id="prod-barcode"
                type="text"
                value={codigoBarras}
                onChange={e => {
                  setCodigoBarras(e.target.value);
                  if (errors.codigoBarras) setErrors({ ...errors, codigoBarras: '' });
                }}
                placeholder="Ex: 7891234567890"
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl font-mono-code font-bold text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all ${
                  errors.codigoBarras ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              {errors.codigoBarras && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.codigoBarras}
                </p>
              )}
            </div>
          </div>

          {/* Live Barcode Preview */}
          {codigoBarras && (
            <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                <span className="font-semibold text-slate-700 block">Visualização do Código de Barras:</span>
                Renderizado em alta resolução vetorial
              </div>
              <div className="shrink-0">
                <BarcodeDisplay value={codigoBarras} height={38} />
              </div>
            </div>
          )}

          {/* Descrição */}
          <div>
            <label htmlFor="prod-descricao" className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              Descrição do Produto <span className="text-rose-500">*</span>
            </label>
            <input
              id="prod-descricao"
              type="text"
              value={descricao}
              onChange={e => {
                setDescricao(e.target.value);
                if (errors.descricao) setErrors({ ...errors, descricao: '' });
              }}
              placeholder="Ex: Teclado Mecânico RGB Switch Blue"
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all ${
                errors.descricao ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
              }`}
            />
            {errors.descricao && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.descricao}
              </p>
            )}
          </div>

          {/* Quantidade */}
          <div>
            <label htmlFor="prod-qtd" className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <Boxes className="w-3.5 h-3.5 text-indigo-600" />
              Quantidade em Estoque <span className="text-rose-500">*</span>
            </label>
            <input
              id="prod-qtd"
              type="number"
              min="0"
              step="1"
              value={quantidade}
              onChange={e => setQuantidade(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-base text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            {errors.quantidade && (
              <p className="text-xs text-rose-600 mt-1">{errors.quantidade}</p>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <div>
              {editingProduct && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    onDelete(editingProduct.id, editingProduct.descricao);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir Produto</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-sm shadow-indigo-300 transition-all hover:shadow"
              >
                <Save className="w-4 h-4" />
                <span>{editingProduct ? 'Salvar Alterações' : 'Cadastrar Produto'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
