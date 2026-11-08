import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateEan13CheckDigit,
  isValidEan13,
  generateRandomEan13,
  generateProductCode,
  encodeCode128
} from './barcode';
import {
  getStockStatus,
  filterProducts,
  sortProducts,
  calculateInventoryStats,
  exportProductsToCSV,
  parseCSVToProducts
} from './inventory';
import { Product } from '../types/product';

test('calculateEan13CheckDigit computes correct Modulo 10 check digit', () => {
  const checkDigit = calculateEan13CheckDigit('789100010010');
  assert.equal(checkDigit, 3);
  assert.equal(isValidEan13('7891000100103'), true);
  assert.equal(isValidEan13('7891000100104'), false);
});

test('generateRandomEan13 produces valid 13-digit EAN code', () => {
  const code = generateRandomEan13();
  assert.equal(code.length, 13);
  assert.equal(isValidEan13(code), true);
});

test('generateProductCode produces sequential SKU without collisions', () => {
  const existing = ['PRD-0001', 'PRD-0002'];
  const next = generateProductCode(existing);
  assert.equal(next, 'PRD-0003');
});

test('encodeCode128 generates non-empty bars for SVG rendering', () => {
  const encoded = encodeCode128('PROD-100');
  assert.ok(encoded.bars.length > 0);
  assert.ok(encoded.totalWidth > 50);
});

test('getStockStatus classifies inventory levels correctly', () => {
  assert.equal(getStockStatus(0), 'ESGOTADO');
  assert.equal(getStockStatus(-2), 'ESGOTADO');
  assert.equal(getStockStatus(1), 'EM_ESTOQUE');
  assert.equal(getStockStatus(50), 'EM_ESTOQUE');
});

test('filterProducts filters by query and status', () => {
  const mockProducts: Product[] = [
    {
      id: '1',
      codigo: 'BEB-001',
      descricao: 'Café Especial 500g',
      codigoBarras: '7891234567890',
      quantidade: 12,
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString()
    },
    {
      id: '2',
      codigo: 'INF-002',
      descricao: 'Teclado Mecânico',
      codigoBarras: '7899876543210',
      quantidade: 2,
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString()
    },
    {
      id: '3',
      codigo: 'INF-003',
      descricao: 'Mouse Gamer',
      codigoBarras: '7891112223334',
      quantidade: 0,
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString()
    }
  ];

  // Search by code
  const result1 = filterProducts(mockProducts, 'BEB-001', 'TODOS');
  assert.equal(result1.length, 1);
  assert.equal(result1[0].descricao, 'Café Especial 500g');

  // Search by barcode
  const result2 = filterProducts(mockProducts, '7899876543210', 'TODOS');
  assert.equal(result2.length, 1);
  assert.equal(result2[0].codigo, 'INF-002');

  // Filter by status
  const result3 = filterProducts(mockProducts, '', 'EM_ESTOQUE');
  assert.equal(result3.length, 2);

  const result4 = filterProducts(mockProducts, '', 'ESGOTADO');
  assert.equal(result4.length, 1);
  assert.equal(result4[0].codigo, 'INF-003');
});

test('calculateInventoryStats aggregates metrics correctly', () => {
  const mockProducts: Product[] = [
    {
      id: '1',
      codigo: 'A',
      descricao: 'Item 1',
      codigoBarras: '1',
      quantidade: 10,
      dataCriacao: '',
      dataAtualizacao: ''
    },
    {
      id: '2',
      codigo: 'B',
      descricao: 'Item 2',
      codigoBarras: '2',
      quantidade: 0,
      dataCriacao: '',
      dataAtualizacao: ''
    }
  ];

  const stats = calculateInventoryStats(mockProducts);
  assert.equal(stats.totalProducts, 2);
  assert.equal(stats.totalItems, 10);
  assert.equal(stats.inStockCount, 1);
  assert.equal(stats.outOfStockCount, 1);
});

test('CSV export and import roundtrip', () => {
  const sampleProducts: Product[] = [
    {
      id: '1',
      codigo: 'PRD-101',
      descricao: 'Produto Teste CSV',
      codigoBarras: '7891234567890',
      quantidade: 25,
      dataCriacao: '',
      dataAtualizacao: ''
    }
  ];

  const csv = exportProductsToCSV(sampleProducts);
  assert.ok(csv.includes('PRD-101'));
  assert.ok(csv.includes('Produto Teste CSV'));

  const parsed = parseCSVToProducts(csv);
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].codigo, 'PRD-101');
  assert.equal(parsed[0].descricao, 'Produto Teste CSV');
  assert.equal(parsed[0].quantidade, 25);
});
