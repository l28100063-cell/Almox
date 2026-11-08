import { Product, StockStatus, SortField, SortOrder } from '../types/product';

/**
 * Returns the stock status based on current quantity.
 */
export function getStockStatus(quantidade: number): StockStatus {
  if (quantidade <= 0) {
    return 'ESGOTADO';
  }
  return 'EM_ESTOQUE';
}

/**
 * Human-readable label for stock status.
 */
export function getStockStatusLabel(status: StockStatus): string {
  switch (status) {
    case 'EM_ESTOQUE':
      return 'Em Estoque';
    case 'ESGOTADO':
      return 'Esgotado';
  }
}

/**
 * Filters products based on search term and status.
 */
export function filterProducts(
  products: Product[],
  searchQuery: string,
  selectedStatus: string
): Product[] {
  const query = searchQuery.trim().toLowerCase();

  return products.filter(product => {
    // Status match
    const status = getStockStatus(product.quantidade);
    if (selectedStatus && selectedStatus !== 'TODOS' && status !== selectedStatus) {
      return false;
    }

    // Query match: código interno, descrição, código de barras
    if (!query) return true;

    return (
      product.codigo.toLowerCase().includes(query) ||
      product.descricao.toLowerCase().includes(query) ||
      product.codigoBarras.toLowerCase().includes(query)
    );
  });
}

/**
 * Sorts products according to field and direction.
 */
export function sortProducts(
  products: Product[],
  field: SortField,
  order: SortOrder
): Product[] {
  return [...products].sort((a, b) => {
    let comparison = 0;
    if (field === 'descricao') {
      comparison = a.descricao.localeCompare(b.descricao, 'pt-BR');
    } else if (field === 'codigo') {
      comparison = a.codigo.localeCompare(b.codigo, 'pt-BR');
    } else if (field === 'quantidade') {
      comparison = a.quantidade - b.quantidade;
    } else if (field === 'dataAtualizacao') {
      comparison = new Date(a.dataAtualizacao).getTime() - new Date(b.dataAtualizacao).getTime();
    }

    return order === 'asc' ? comparison : -comparison;
  });
}

/**
 * Calculates summary stats across the inventory.
 */
export function calculateInventoryStats(products: Product[]) {
  let totalItems = 0;
  let inStockCount = 0;
  let outOfStockCount = 0;

  for (const p of products) {
    const qty = p.quantidade || 0;
    totalItems += qty;

    const status = getStockStatus(qty);
    if (status === 'ESGOTADO') {
      outOfStockCount++;
    } else {
      inStockCount++;
    }
  }

  return {
    totalProducts: products.length,
    totalItems,
    inStockCount,
    outOfStockCount
  };
}

/**
 * Exports products to a semicolon-delimited CSV string with UTF-8 BOM for Excel.
 */
export function exportProductsToCSV(products: Product[]): string {
  const headers = ['Código Interno', 'Descrição', 'Código de Barras', 'Quantidade'];

  const rows = products.map(p => [
    `"${p.codigo.replace(/"/g, '""')}"`,
    `"${p.descricao.replace(/"/g, '""')}"`,
    `"${p.codigoBarras.replace(/"/g, '""')}"`,
    p.quantidade
  ]);

  const csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
  return '\uFEFF' + csvContent; // UTF-8 BOM
}

/**
 * Parses CSV lines into product candidate objects.
 */
export function parseCSVToProducts(csvText: string): Partial<Product>[] {
  const clean = csvText.replace(/^\uFEFF/, '').trim();
  const lines = clean.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length <= 1) return [];

  // Determine separator (; or ,)
  const headerLine = lines[0];
  const separator = headerLine.includes(';') ? ';' : ',';

  const results: Partial<Product>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const cells = line.split(separator).map(cell => cell.trim().replace(/^["']|["']$/g, '').trim());
    if (cells.length < 3) continue;

    const codigo = cells[0] || `PRD-${Date.now().toString().slice(-4)}`;
    const descricao = cells[1] || 'Produto Importado';
    const codigoBarras = cells[2] || '';
    const quantidade = parseFloat(cells[3]?.replace(',', '.') || '0') || 0;

    results.push({
      codigo,
      descricao,
      codigoBarras,
      quantidade
    });
  }

  return results;
}
