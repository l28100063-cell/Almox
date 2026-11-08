export type StockStatus = 'EM_ESTOQUE' | 'ESGOTADO';

export interface Product {
  id: string;
  codigo: string;          // Código interno do produto
  descricao: string;       // Descrição / Nome
  codigoBarras: string;    // Código de barras (EAN-13, Code 128, etc.)
  quantidade: number;      // Quantidade atual em estoque
  unidade?: string;        // Opcional: UN
  observacoes?: string;    // Opcional: Notas extras
  dataCriacao: string;     // ISO timestamp
  dataAtualizacao: string; // ISO timestamp
}

export type MovementType = 'ENTRADA' | 'SAIDA' | 'AJUSTE';

export interface StockMovement {
  id: string;
  produtoId: string;
  codigoProduto: string;
  descricaoProduto: string;
  tipo: MovementType;
  quantidade: number;
  quantidadeAnterior: number;
  quantidadeNova: number;
  motivo: string;
  data: string; // ISO timestamp
}

export type SortField = 'descricao' | 'codigo' | 'quantidade' | 'dataAtualizacao';
export type SortOrder = 'asc' | 'desc';
