import { findCategory, CLEARANCE_FEES, type ClearanceType } from "./customs-categories";

/**
 * Resultado completo do cálculo aduaneiro.
 * Sequência obrigatória: FOB → Frete → Seguro → CIF → CIF MT → D.A. → ICE → IVA → Sobretaxa → Taxas → Total
 */
export interface CalculationResult {
  fob: number;
  freight: number;
  insurance: number;
  cif: number;
  cifMt: number;
  da: number;
  ice: number;
  iva: number;
  sobretaxa: number;
  fee: number;
  totalTaxes: number;
  total: number;
}

export interface CalculationInput {
  fob: number;
  /** Se true, o frete foi declarado na factura e freightValue será usado.
   *  Se false, o frete é calculado como FOB × 10%. */
  freightDeclaredOnInvoice: boolean;
  /** Valor do frete declarado na factura (só usado se freightDeclaredOnInvoice === true). */
  freightValue?: number;
  exchangeRate: number;
  categoryId: string;
  clearanceType: ClearanceType;
  /** Taxa de sobretaxa em percentagem decimal (ex.: 0.05 = 5%). */
  sobretaxaRate?: number;
}

/**
 * Motor único de cálculo aduaneiro.
 *
 * Fonte: "Fórmulas de Cálculo dos Direitos e Demais Imposições" (documento oficial)
 *
 * Ordem de cálculo (obrigatória, não alterar):
 * 1. FOB
 * 2. Frete
 * 3. Seguro
 * 4. CIF
 * 5. CIF MT
 * 6. D.A. (Direitos Aduaneiros)
 * 7. ICE
 * 8. IVA
 * 9. Sobretaxa
 * 10. Taxas Administrativas
 * 11. Total Geral
 */
export function calculateCustoms(input: CalculationInput): CalculationResult {
  const cat = findCategory(input.categoryId);
  if (!cat) {
    throw new Error(`Categoria desconhecida: ${input.categoryId}`);
  }

  // 1. FOB
  const fob = input.fob;

  // 2. Frete: FOB × 10% apenas se NÃO declarado na factura
  const freight = input.freightDeclaredOnInvoice ? (input.freightValue ?? fob * 0.1) : fob * 0.1;

  // 3. Seguro: (FOB + Frete) × 2%
  const insurance = (fob + freight) * 0.02;

  // 4. CIF: FOB + Frete + Seguro
  const cif = fob + freight + insurance;

  // 5. CIF MT: CIF × Câmbio
  const cifMt = cif * input.exchangeRate;

  // 6. D.A. (Direitos Aduaneiros): CIF MT × Taxa D.A.
  const da = cifMt * cat.da;

  // 7. ICE: CIF MT × Taxa ICE (com valor mínimo se disponível)
  let ice = 0;
  if (cat.ice !== undefined && cat.ice !== null) {
    ice = cifMt * cat.ice;
    if (cat.minIce !== undefined && cat.minIce !== null) {
      ice = Math.max(ice, cat.minIce);
    }
  }

  // 8. IVA: (CIF MT + D.A. + ICE) × Taxa IVA
  const iva = cat.iva !== undefined && cat.iva !== null ? (cifMt + da + ice) * cat.iva : 0;

  // 9. Sobretaxa: CIF × Taxa Sobretaxa (NÃO usa CIF MT)
  //    O valor obtido está na moeda original; multiplica-se pelo câmbio para MZN.
  const sobretaxa = input.sobretaxaRate ? cif * input.sobretaxaRate * input.exchangeRate : 0;

  // 10. Taxas Administrativas
  const fee = CLEARANCE_FEES[input.clearanceType];

  // 11. Total de Impostos e Taxas
  const totalTaxes = da + ice + iva + sobretaxa;

  // 12. Total Final: CIF MT + D.A. + ICE + IVA + Sobretaxa + Taxas
  const total = cifMt + totalTaxes + fee;

  return {
    fob,
    freight,
    insurance,
    cif,
    cifMt,
    da,
    ice,
    iva,
    sobretaxa,
    fee,
    totalTaxes,
    total,
  };
}
