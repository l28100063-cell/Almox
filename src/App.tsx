/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  LayoutGrid,
  List,
  History,
  RotateCcw,
  Check,
  AlertCircle
} from 'lucide-react';

import { Product, StockMovement, SortField, SortOrder, MovementType } from './types/product';
import { INITIAL_PRODUCTS } from './utils/seedData';
import {
  filterProducts,
  sortProducts,
  calculateInventoryStats
} from './utils/inventory';

import { Header } from './components/Header';
import { DashboardStats } from './components/DashboardStats';
import { ProductTable } from './components/ProductTable';
import { ProductCards } from './components/ProductCards';
import { ProductModal } from './components/ProductModal';
import { StockMovementModal } from './components/StockMovementModal';
import { StockHistoryModal } from './components/StockHistoryModal';
import { BarcodeLabelsModal } from './components/BarcodeLabelsModal';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { ExportImportModal } from './components/ExportImportModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';

const STORAGE_KEY_PRODUCTS = 'estoquefacil_produtos_v2';
const STORAGE_KEY_HISTORY = 'estoquefacil_movimentacoes_v2';

export default function App() {
  // Load initial products from localStorage or fallback to initial seed
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Falha ao ler produtos salvos:', e);
    }
    return INITIAL_PRODUCTS;
  });

  // Stock movement history
  const [movements, setMovements] = useState<StockMovement[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Falha ao ler histórico salvo:', e);
    }
    return [
      {
        id: 'mov-init-1',
        produtoId: 'prod-001',
        codigoProduto: 'ALM-1001',
        descricaoProduto: 'Café Torrado e Moído Gourmet 500g',
        tipo: 'ENTRADA',
        quantidade: 48,
        quantidadeAnterior: 0,
        quantidadeNova: 48,
        motivo: 'Carga inicial de estoque',
        data: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
      }
    ];
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error('Erro ao persistir produtos:', e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(movements));
    } catch (e) {
      console.error('Erro ao persistir histórico:', e);
    }
  }, [movements]);

  // View, search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('TODOS');
  const [sortField, setSortField] = useState<SortField>('dataAtualizacao');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modal control states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementTargetProduct, setMovementTargetProduct] = useState<Product | null>(null);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isLabelsModalOpen, setIsLabelsModalOpen] = useState(false);
  const [labelsInitialProductId, setLabelsInitialProductId] = useState<string | undefined>(undefined);

  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [isExportImportOpen, setIsExportImportOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{ id: string; descricao: string; codigo?: string } | null>(null);

  // Toast feedback state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Inventory statistics calculation
  const stats = useMemo(() => calculateInventoryStats(products), [products]);

  // Filter and sort products list
  const filteredAndSortedProducts = useMemo(() => {
    const filtered = filterProducts(products, searchQuery, selectedStatus);
    return sortProducts(filtered, sortField, sortOrder);
  }, [products, searchQuery, selectedStatus, sortField, sortOrder]);

  const existingCodes = useMemo(() => products.map(p => p.codigo), [products]);

  // Handle Save (Create or Update) Product
  const handleSaveProduct = (
    productData: Omit<Product, 'id' | 'dataCriacao' | 'dataAtualizacao'>,
    id?: string
  ) => {
    const now = new Date().toISOString();

    if (id) {
      // Update existing
      setProducts(prev =>
        prev.map(p => {
          if (p.id === id) {
            const qtyChanged = p.quantidade !== productData.quantidade;
            if (qtyChanged) {
              const delta = productData.quantidade - p.quantidade;
              const newMovement: StockMovement = {
                id: `mov-${Date.now()}`,
                produtoId: id,
                codigoProduto: productData.codigo,
                descricaoProduto: productData.descricao,
                tipo: 'AJUSTE',
                quantidade: Math.abs(delta),
                quantidadeAnterior: p.quantidade,
                quantidadeNova: productData.quantidade,
                motivo: 'Ajuste direto na edição do cadastro',
                data: now
              };
              setMovements(m => [newMovement, ...m]);
            }

            return {
              ...p,
              ...productData,
              dataAtualizacao: now
            };
          }
          return p;
        })
      );
      showToast(`Produto "${productData.descricao}" atualizado com sucesso!`);
    } else {
      // Create new
      const newId = `prod-${Date.now()}`;
      const newProduct: Product = {
        ...productData,
        id: newId,
        dataCriacao: now,
        dataAtualizacao: now
      };

      setProducts(prev => [newProduct, ...prev]);

      // Record initial stock entry
      if (productData.quantidade > 0) {
        const initialMovement: StockMovement = {
          id: `mov-${Date.now()}`,
          produtoId: newId,
          codigoProduto: productData.codigo,
          descricaoProduto: productData.descricao,
          tipo: 'ENTRADA',
          quantidade: productData.quantidade,
          quantidadeAnterior: 0,
          quantidadeNova: productData.quantidade,
          motivo: 'Estoque inicial de cadastro',
          data: now
        };
        setMovements(m => [initialMovement, ...m]);
      }

      showToast(`Produto "${productData.descricao}" cadastrado com sucesso!`);
    }
  };

  // Handle Delete Product trigger
  const handleDeleteProduct = (id: string, descricao: string) => {
    const prod = products.find(p => p.id === id);
    setProductToDelete({ id, descricao, codigo: prod?.codigo });
  };

  // Perform confirmed deletion
  const handleConfirmDelete = () => {
    if (!productToDelete) return;
    const { id, descricao } = productToDelete;
    setProducts(prev => prev.filter(p => p.id !== id));
    showToast(`Produto "${descricao}" excluído com sucesso!`, 'info');
    setProductToDelete(null);
  };

  // Handle Stock Movement Confirmation
  const handleConfirmMovement = (
    productId: string,
    tipo: MovementType,
    delta: number,
    motivo: string
  ) => {
    const now = new Date().toISOString();

    setProducts(prev =>
      prev.map(p => {
        if (p.id === productId) {
          let newQty = p.quantidade;
          let appliedAmount = 0;

          if (tipo === 'ENTRADA') {
            appliedAmount = delta;
            newQty = p.quantidade + delta;
          } else if (tipo === 'SAIDA') {
            appliedAmount = delta;
            newQty = Math.max(0, p.quantidade - delta);
          } else {
            // AJUSTE
            appliedAmount = Math.abs(delta);
            newQty = Math.max(0, p.quantidade + delta);
          }

          const movement: StockMovement = {
            id: `mov-${Date.now()}`,
            produtoId: p.id,
            codigoProduto: p.codigo,
            descricaoProduto: p.descricao,
            tipo,
            quantidade: appliedAmount,
            quantidadeAnterior: p.quantidade,
            quantidadeNova: newQty,
            motivo,
            data: now
          };
          setMovements(m => [movement, ...m]);

          return {
            ...p,
            quantidade: newQty,
            dataAtualizacao: now
          };
        }
        return p;
      })
    );

    showToast('Movimentação de estoque registrada com sucesso!');
  };

  // Handle Import from CSV / JSON
  const handleImportProducts = (imported: Partial<Product>[]) => {
    const now = new Date().toISOString();
    const formatted: Product[] = imported.map((item, idx) => ({
      id: item.id || `prod-imp-${Date.now()}-${idx}`,
      codigo: item.codigo || `PRD-${Date.now().toString().slice(-4)}`,
      descricao: item.descricao || 'Produto Importado',
      codigoBarras: item.codigoBarras || '',
      quantidade: item.quantidade ?? 0,
      unidade: item.unidade || 'UN',
      observacoes: item.observacoes || '',
      dataCriacao: item.dataCriacao || now,
      dataAtualizacao: now
    }));

    setProducts(prev => {
      // merge avoiding duplicate codes by replacing or adding
      const existingMap = new Map(prev.map(p => [p.codigo.toLowerCase(), p]));
      for (const item of formatted) {
        existingMap.set(item.codigo.toLowerCase(), item);
      }
      return Array.from(existingMap.values());
    });

    showToast(`${formatted.length} produtos importados com sucesso!`);
  };

  // Handle Reset to Demo Defaults
  const handleRestoreDefaults = () => {
    setProducts(INITIAL_PRODUCTS);
    setSearchQuery('');
    setSelectedStatus('TODOS');
    showToast('Produtos de demonstração restaurados!');
  };

  // Open Edit modal
  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  // Open Print modal for specific single product
  const handlePrintSingleLabel = (productId: string) => {
    setLabelsInitialProductId(productId);
    setIsLabelsModalOpen(true);
  };

  // Sort change helper
  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Toast alert */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-xl text-xs font-semibold animate-in slide-in-from-bottom-3 duration-200 no-print">
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          ) : (
            <Check className="w-4 h-4 text-emerald-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        onNewProduct={() => {
          setEditingProduct(null);
          setIsProductModalOpen(true);
        }}
        onOpenScanner={() => setIsScannerModalOpen(true)}
        onOpenLabels={() => {
          setLabelsInitialProductId('ALL');
          setIsLabelsModalOpen(true);
        }}
        onOpenExportImport={() => setIsExportImportOpen(true)}
        outOfStockCount={stats.outOfStockCount}
        totalProducts={stats.totalProducts}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {/* Dashboard Metric Cards */}
        <DashboardStats
          totalProducts={stats.totalProducts}
          totalItems={stats.totalItems}
          inStockCount={stats.inStockCount}
          outOfStockCount={stats.outOfStockCount}
          onFilterInStock={() => setSelectedStatus('EM_ESTOQUE')}
          onFilterOutOfStock={() => setSelectedStatus('ESGOTADO')}
          onResetFilters={() => {
            setSelectedStatus('TODOS');
            setSearchQuery('');
          }}
          selectedStatus={selectedStatus}
        />

        {/* Search & Filter Toolbar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-xs no-print space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input: código interno, descrição, código de barras */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar por código interno, descrição ou código de barras..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-xs text-slate-400 hover:text-slate-600"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Filter Dropdowns and Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filter */}
              <div className="relative flex-1 sm:flex-initial">
                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                >
                  <option value="TODOS">Todos os Status</option>
                  <option value="EM_ESTOQUE">Em Estoque</option>
                  <option value="ESGOTADO">Esgotado</option>
                </select>
              </div>

              {/* Movement History trigger */}
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(true)}
                aria-label="Histórico de Movimentações"
                className="px-3 py-2.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5"
                title="Ver log de movimentações de estoque"
              >
                <History className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Histórico</span>
              </button>

              {/* View mode toggle (Table vs Cards) */}
              <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  aria-label="Visualização em Tabela"
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === 'table'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Visualização em Tabela"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  aria-label="Visualização em Cartões"
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === 'cards'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Visualização em Cartões"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Active filters summary bar */}
          {(searchQuery || selectedStatus !== 'TODOS') && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
              <div className="flex items-center gap-2 flex-wrap">
                <span>Filtrando por:</span>
                {searchQuery && (
                  <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-medium">
                    Busca: "{searchQuery}"
                  </span>
                )}
                {selectedStatus !== 'TODOS' && (
                  <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md font-medium">
                    Status: {selectedStatus === 'EM_ESTOQUE' ? 'Em Estoque' : 'Esgotado'}
                  </span>
                )}
                <span>({filteredAndSortedProducts.length} itens encontrados)</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStatus('TODOS');
                }}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>

        {/* Products Listing (Table or Card View) */}
        {viewMode === 'table' ? (
          <ProductTable
            products={filteredAndSortedProducts}
            onEdit={handleOpenEdit}
            onDelete={handleDeleteProduct}
            onPrintSingleLabel={handlePrintSingleLabel}
            sortField={sortField}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
          />
        ) : (
          <ProductCards
            products={filteredAndSortedProducts}
            onEdit={handleOpenEdit}
            onDelete={handleDeleteProduct}
            onPrintSingleLabel={handlePrintSingleLabel}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            <strong>EstoqueFácil</strong> • Cadastro de produtos com Código Interno, Descrição, Código de Barras e Quantidade.
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleRestoreDefaults}
              className="hover:text-slate-800 transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restaurar dados de teste
            </button>
            <span>•</span>
            <span>Leitores de código de barras USB & Impressão de Etiquetas</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}

      {/* Product Create / Edit Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        onDelete={handleDeleteProduct}
        editingProduct={editingProduct}
        existingCodes={existingCodes}
      />

      {/* Stock Movement Modal */}
      <StockMovementModal
        isOpen={isMovementModalOpen}
        onClose={() => {
          setIsMovementModalOpen(false);
          setMovementTargetProduct(null);
        }}
        product={movementTargetProduct}
        onConfirm={handleConfirmMovement}
      />

      {/* Stock History Audit Log Modal */}
      <StockHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        movements={movements}
        onClearHistory={() => setMovements([])}
      />

      {/* Barcode Labels Print Modal */}
      <BarcodeLabelsModal
        isOpen={isLabelsModalOpen}
        onClose={() => setIsLabelsModalOpen(false)}
        products={products}
        initialSelectedProductId={labelsInitialProductId}
      />

      {/* Barcode Scanner / Bip Modal */}
      <BarcodeScannerModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        products={products}
        onSelectProductToEdit={handleOpenEdit}
      />

      {/* Export / Import Modal */}
      <ExportImportModal
        isOpen={isExportImportOpen}
        onClose={() => setIsExportImportOpen(false)}
        products={products}
        onImportProducts={handleImportProducts}
        onRestoreDefaults={handleRestoreDefaults}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(productToDelete)}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleConfirmDelete}
        productTitle={productToDelete?.descricao || ''}
        productCode={productToDelete?.codigo}
      />
    </div>
  );
}
