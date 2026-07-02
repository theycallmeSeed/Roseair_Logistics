/**
 * AUDIT: Verificação do motor de cálculo contra o documento oficial
 * "Fórmulas de Cálculo dos Direitos e Demais Imposições"
 *
 * Cada secção:
 * 1. Mostra a fórmula do documento oficial
 * 2. Calcula o valor esperado manualmente (passo a passo)
 * 3. Obtém o resultado do motor
 * 4. Compara e reporta cada diferença decimal
 */
import { describe, it, expect } from "vitest";
import { calculateCustoms } from "../calculation-engine";

// ============================================================
// TRABALHO EXEMPLO 1: Material de construção (carga geral)
// FOB = 10 000 USD, Câmbio = 63.2 MZN/USD, Frete NÃO declarado na factura
// ============================================================
//
// Passo 1: FOB = 10 000 USD
// Passo 2: Frete = FOB × 10% = 10 000 × 0.10 = 1 000 USD
// Passo 3: Seguro = (FOB + Frete) × 2% = (10 000 + 1 000) × 0.02 = 220 USD
// Passo 4: CIF = FOB + Frete + Seguro = 10 000 + 1 000 + 220 = 11 220 USD
// Passo 5: CIF MT = CIF × Câmbio = 11 220 × 63.2 = 709 104 MZN
// Passo 6: D.A. = CIF MT × 7.5% = 709 104 × 0.075 = 53 182.8 MZN
// Passo 7: ICE = 0 (não aplicável)
// Passo 8: IVA = (CIF MT + D.A. + ICE) × 16%
//          = (709 104 + 53 182.8 + 0) × 0.16
//          = 762 286.8 × 0.16
//          = 121 965.888 MZN
// Passo 9: Sobretaxa = 0 (não aplicável)
// Passo 10: Taxa (Normal) = 2 500 MZN
// Passo 11: Total Impostos = D.A. + ICE + IVA + Sobretaxa = 53 182.8 + 121 965.888 = 175 148.688 MZN
// Passo 12: Total Final = CIF MT + Total Impostos + Taxa = 709 104 + 175 148.688 + 2 500 = 886 752.688 MZN

const FOB = 10_000;
const E_FOB = FOB;
const EXCHANGE = 63.2;

// --- Expected manual calculation ---
const E_FRETE = FOB * 0.1; // 1 000
const E_SEGURO = (FOB + E_FRETE) * 0.02; // 220
const E_CIF = FOB + E_FRETE + E_SEGURO; // 11 220
const E_CIF_MT = E_CIF * EXCHANGE; // 709 104
const E_DA = E_CIF_MT * 0.075; // 53 182.8
const E_IVA_BASE = E_CIF_MT + E_DA; // 762 286.8
const E_IVA = E_IVA_BASE * 0.16; // 121 965.888
const E_TOTAL_TAXES = E_DA + E_IVA; // 175 148.688
const E_TOTAL = E_CIF_MT + E_TOTAL_TAXES + 2_500; // 886 752.688

describe("Audit: Trabalho Exemplo 1 — Material de construção", () => {
  const result = calculateCustoms({
    fob: FOB,
    freightDeclaredOnInvoice: false,
    exchangeRate: EXCHANGE,
    categoryId: "g_construcao",
    clearanceType: "normal",
  });

  it("Passo 1: FOB", () => {
    const diff = Math.abs(result.fob - E_FOB);
    expect(result.fob).toBe(E_FOB);
    console.log(`  FOB: esperado=${E_FOB}, obtido=${result.fob}, diff=${diff}`);
  });

  it("Passo 2: Frete = FOB × 10%", () => {
    const diff = Math.abs(result.freight - E_FRETE);
    expect(diff).toBeLessThan(1e-9);
    console.log(`  Frete: esperado=${E_FRETE}, obtido=${result.freight}, diff=${diff}  ✅`);
  });

  it("Passo 3: Seguro = (FOB + Frete) × 2%", () => {
    const diff = Math.abs(result.insurance - E_SEGURO);
    expect(diff).toBeLessThan(1e-9);
    console.log(`  Seguro: esperado=${E_SEGURO}, obtido=${result.insurance}, diff=${diff}  ✅`);
  });

  it("Passo 4: CIF = FOB + Frete + Seguro", () => {
    const diff = Math.abs(result.cif - E_CIF);
    const decomp = `${FOB} + ${E_FRETE} + ${E_SEGURO} = ${E_CIF}`;
    expect(diff).toBeLessThan(1e-9);
    console.log(`  CIF: esperado=${E_CIF} (${decomp}), obtido=${result.cif}, diff=${diff}  ✅`);
  });

  it("Passo 5: CIF MT = CIF × Câmbio", () => {
    const diff = Math.abs(result.cifMt - E_CIF_MT);
    const decomp = `${E_CIF} × ${EXCHANGE} = ${E_CIF_MT}`;
    expect(diff).toBeLessThan(1e-9);
    console.log(
      `  CIF MT: esperado=${E_CIF_MT} (${decomp}), obtido=${result.cifMt}, diff=${diff}  ✅`,
    );
  });

  it("Passo 6: D.A. = CIF MT × 7.5%", () => {
    const diff = Math.abs(result.da - E_DA);
    const decomp = `${E_CIF_MT} × 0.075 = ${E_DA}`;
    expect(diff).toBeLessThan(1e-9);
    console.log(`  D.A.: esperado=${E_DA} (${decomp}), obtido=${result.da}, diff=${diff}  ✅`);
  });

  it("Passo 7: ICE = 0 (não aplicável a carga geral)", () => {
    expect(result.ice).toBe(0);
    console.log(`  ICE: esperado=0, obtido=${result.ice}  ✅`);
  });

  it("Passo 8: IVA = (CIF MT + D.A. + ICE) × 16%", () => {
    const diff = Math.abs(result.iva - E_IVA);
    const decomp = `(${E_CIF_MT} + ${E_DA} + 0) × 0.16 = ${E_CIF_MT + E_DA} × 0.16 = ${E_IVA}`;
    expect(diff).toBeLessThan(1e-9);
    console.log(`  IVA: esperado=${E_IVA} (${decomp}), obtido=${result.iva}, diff=${diff}  ✅`);
  });

  it("Passo 9: Sobretaxa = 0", () => {
    expect(result.sobretaxa).toBe(0);
  });

  it("Passo 10: Taxa Administrativa (Normal) = 2 500 MZN", () => {
    expect(result.fee).toBe(2_500);
  });

  it("Passo 11: Total Impostos = D.A. + ICE + IVA + Sobretaxa", () => {
    const decomp = `${E_DA} + ${0} + ${E_IVA} + ${0} = ${E_TOTAL_TAXES}`;
    const diff = Math.abs(result.totalTaxes - E_TOTAL_TAXES);
    expect(diff).toBeLessThan(0.01);
    console.log(
      `  TotalImpostos: esperado=${E_TOTAL_TAXES} (${decomp}), obtido=${result.totalTaxes}, diff=${diff}  ✅`,
    );
  });

  it("Passo 12: Total Final = CIF MT + Impostos + Taxa", () => {
    const decomp = `${E_CIF_MT} + ${E_TOTAL_TAXES} + 2500 = ${E_TOTAL}`;
    const diff = Math.abs(result.total - E_TOTAL);
    expect(diff).toBeLessThan(0.01);
    console.log(
      `  Total: esperado=${E_TOTAL} (${decomp}), obtido=${result.total}, diff=${diff}  ✅`,
    );
  });
});

// ============================================================
// TRABALHO EXEMPLO 2: Veículos mercadorias (Diesel) até 5t
// FOB = 15 000 USD, Câmbio = 63.2, Frete NÃO declarado na factura
// Documento: D.A. 5% (sem ICE, sem IVA)
// ============================================================
//
// Passo 1: FOB = 15 000 USD
// Passo 2: Frete = 15 000 × 10% = 1 500 USD
// Passo 3: Seguro = (15 000 + 1 500) × 2% = 330 USD
// Passo 4: CIF = 15 000 + 1 500 + 330 = 16 830 USD
// Passo 5: CIF MT = 16 830 × 63.2 = 1 063 656 MZN
// Passo 6: D.A. = 1 063 656 × 5% = 53 182.8 MZN
// Passo 7: ICE = 0
// Passo 8: IVA = 0 (documento: sem IVA para esta categoria)
// Passo 9: Sobretaxa = 0
// Passo 10: Taxa (Expresso) = 7 500 MZN
// Passo 11: Total Impostos = 53 182.8 MZN
// Passo 12: Total Final = 1 063 656 + 53 182.8 + 7 500 = 1 124 338.8 MZN

describe("Audit: Trabalho Exemplo 2 — Veículos mercadorias Diesel até 5t", () => {
  const result = calculateCustoms({
    fob: 15_000,
    freightDeclaredOnInvoice: false,
    exchangeRate: 63.2,
    categoryId: "v_merc_diesel_5t",
    clearanceType: "expresso",
  });

  it("Sequência completa (valores exactos do documento oficial)", () => {
    // 1. FOB
    expect(result.fob).toBe(15_000);

    // 2. Frete = FOB × 10%
    expect(result.freight).toBe(1_500);

    // 3. Seguro = (FOB + Frete) × 2%
    expect(result.insurance).toBe(330);

    // 4. CIF = FOB + Frete + Seguro
    expect(result.cif).toBe(16_830);

    // 5. CIF MT = CIF × Câmbio
    expect(result.cifMt).toBe(1_063_656);

    // 6. D.A. = CIF MT × 5%
    expect(result.da).toBe(53_182.8);

    // 7. ICE = 0
    expect(result.ice).toBe(0);

    // 8. IVA = 0 (categoria sem IVA)
    expect(result.iva).toBe(0);

    // 9. Sobretaxa = 0
    expect(result.sobretaxa).toBe(0);

    // 10. Taxa expresso
    expect(result.fee).toBe(7_500);

    // 11. Total Impostos
    expect(Math.abs(result.totalTaxes - 53_182.8)).toBeLessThan(0.01);

    // 12. Total Final
    expect(Math.abs(result.total - 1_124_338.8)).toBeLessThan(0.01);
  });
});

// ============================================================
// TRABALHO EXEMPLO 3: Automóveis passageiros gasolina até 1000cm³
// FOB = 8 000 USD, Câmbio = 63.2, Frete DECLARADO na factura = 600 USD
// Documento: D.A. 20% + ICE 5% + IVA 16%
// ============================================================
//
// Passo 1: FOB = 8 000 USD
// Passo 2: Frete = 600 USD (declarado na factura — NÃO usar 10%)
// Passo 3: Seguro = (8 000 + 600) × 2% = 172 USD
// Passo 4: CIF = 8 000 + 600 + 172 = 8 772 USD
// Passo 5: CIF MT = 8 772 × 63.2 = 554 390.4 MZN
// Passo 6: D.A. = 554 390.4 × 20% = 110 878.08 MZN
// Passo 7: ICE (passageiros a gasolina ≤1000cc) = 554 390.4 × 5% = 27 719.52 MZN
// Passo 8: IVA = (CIF MT + D.A. + ICE) × 16%
//          = (554 390.4 + 110 878.08 + 27 719.52) × 0.16
//          = 692 988.0 × 0.16
//          = 110 878.08 MZN
// Passo 9: Sobretaxa = 0
// Passo 10: Taxa (Prioritário) = 15 000 MZN
// Passo 11: Total Impostos = 110 878.08 + 27 719.52 + 110 878.08 = 249 475.68 MZN
// Passo 12: Total Final = 554 390.4 + 249 475.68 + 15 000 = 818 866.08 MZN

describe("Audit: Trabalho Exemplo 3 — Automóveis passageiros gasolina ≤1000cc com frete declarado", () => {
  const result = calculateCustoms({
    fob: 8_000,
    freightDeclaredOnInvoice: true,
    freightValue: 600,
    exchangeRate: 63.2,
    categoryId: "v_gas_1000",
    clearanceType: "prioritario",
  });

  it("Sequência completa com frete declarado na factura", () => {
    expect(result.fob).toBe(8_000);
    expect(result.freight).toBe(600); // USOU 600, NÃO 10%
    expect(result.insurance).toBe(172); // (8000+600)×2%
    expect(result.cif).toBe(8_772); // 8000+600+172
    expect(result.cifMt).toBe(554_390.4); // 8772×63.2
    expect(Math.abs(result.da - 110_878.08)).toBeLessThan(0.01); // 554390.4×20%
    expect(Math.abs(result.ice - 27_719.52)).toBeLessThan(0.01); // 554390.4×5%
    expect(Math.abs(result.iva - 110_878.08)).toBeLessThan(0.01); // (554390.4+110878.08+27719.52)×16%
    expect(result.sobretaxa).toBe(0);
    expect(result.fee).toBe(15_000);
    expect(Math.abs(result.totalTaxes - 249_475.68)).toBeLessThan(0.01);
    expect(Math.abs(result.total - 818_866.08)).toBeLessThan(0.01);
  });
});

// ============================================================
// TRABALHO EXEMPLO 4: Caso completo com todas as etapas
// incluindo Sobretaxa (simulada, pois nenhuma categoria actual a usa)
// FOB = 50 000 USD, Câmbio = 63.2, Frete NÃO declarado
// Categoria: Máquinas e equipamentos (D.A. 5% + IVA 16%)
// + Sobretaxa hipotética de 3% para verificar a fórmula
// ============================================================
//
// Passo 1: FOB = 50 000
// Passo 2: Frete = 50 000 × 10% = 5 000
// Passo 3: Seguro = (50 000 + 5 000) × 2% = 1 100
// Passo 4: CIF = 50 000 + 5 000 + 1 100 = 56 100 USD
// Passo 5: CIF MT = 56 100 × 63.2 = 3 545 520 MZN
// Passo 6: D.A. = 3 545 520 × 5% = 177 276 MZN
// Passo 7: ICE = 0
// Passo 8: IVA = (3 545 520 + 177 276 + 0) × 16% = 3 722 796 × 0.16 = 595 647.36 MZN
// Passo 9: Sobretaxa = CIF × Taxa × Câmbio = 56 100 × 0.03 × 63.2 = 106 365.6 MZN
//          (Documento: Sobretaxa = CIF × Taxa. Convertido para MZN.)
// Passo 10: Taxa (Normal) = 2 500 MZN
// Passo 11: Total Impostos = 177 276 + 0 + 595 647.36 + 106 365.6 = 879 288.96 MZN
// Passo 12: Total Final = 3 545 520 + 879 288.96 + 2 500 = 4 427 308.96 MZN

const E4_FOB = 50_000;
const E4_FRETE = 5_000;
const E4_SEGURO = 1_100;
const E4_CIF = 56_100;
const E4_CIF_MT = 3_545_520;
const E4_DA = 177_276;
const E4_IVA = 595_647.36;
const E4_SOBRETAXA = 106_365.6;
const E4_TOTAL_TAXES = 879_288.96;
const E4_TOTAL = 4_427_308.96;

describe("Audit: Trabalho Exemplo 4 — Máquinas com Sobretaxa simulada 3%", () => {
  const result = calculateCustoms({
    fob: E4_FOB,
    freightDeclaredOnInvoice: false,
    exchangeRate: 63.2,
    categoryId: "g_maquinas",
    clearanceType: "normal",
    sobretaxaRate: 0.03,
  });

  it("FOB", () => {
    expect(result.fob).toBe(E4_FOB);
  });
  it("Frete = FOB × 10%", () => {
    expect(Math.abs(result.freight - E4_FRETE)).toBeLessThan(1e-9);
  });
  it("Seguro = (FOB + Frete) × 2%", () => {
    expect(Math.abs(result.insurance - E4_SEGURO)).toBeLessThan(1e-9);
  });
  it("CIF = FOB + Frete + Seguro", () => {
    expect(Math.abs(result.cif - E4_CIF)).toBeLessThan(1e-9);
  });
  it("CIF MT = CIF × Câmbio", () => {
    expect(Math.abs(result.cifMt - E4_CIF_MT)).toBeLessThan(1e-9);
  });
  it("D.A. = CIF MT × 5%", () => {
    expect(Math.abs(result.da - E4_DA)).toBeLessThan(1e-9);
  });
  it("ICE = 0", () => {
    expect(result.ice).toBe(0);
  });
  it("IVA = (CIF MT + D.A.) × 16%", () => {
    expect(Math.abs(result.iva - E4_IVA)).toBeLessThan(0.01);
  });

  it("Sobretaxa = CIF × Taxa × Câmbio (documento: CIF × Taxa, convertido p/ MZN)", () => {
    // Documento oficial: Sobretaxa = CIF × Taxa (NÃO CIF MT × Taxa)
    // O motor faz: cif × sobretaxaRate × exchangeRate
    // Matematicamente: CIF × taxa × câmbio = CIF_MT × taxa
    // Verificar: E4_CIF × 0.03 × 63.2 = E4_CIF_MT × 0.03
    const expectedCifFormula = E4_CIF * 0.03; // Sobretaxa em USD = 1 683 USD
    const expectedConverted = expectedCifFormula * 63.2; // Convertido p/ MZN = 106 365.6
    expect(expectedConverted).toBe(E4_SOBRETAXA);
    expect(Math.abs(result.sobretaxa - E4_SOBRETAXA)).toBeLessThan(1e-9);
    console.log(`  Sobretaxa:
    Documento: CIF × Taxa = ${E4_CIF} × 0.03 = ${expectedCifFormula} USD
    Convertido: ${expectedCifFormula} × 63.2 = ${expectedConverted} MZN
    Motor: ${result.sobretaxa} MZN
    Diff: ${Math.abs(result.sobretaxa - E4_SOBRETAXA)}  ✅`);
  });

  it("Total Impostos = D.A. + ICE + IVA + Sobretaxa", () => {
    expect(Math.abs(result.totalTaxes - E4_TOTAL_TAXES)).toBeLessThan(0.01);
  });

  it("Total Final = CIF MT + Impostos + Taxa", () => {
    expect(Math.abs(result.total - E4_TOTAL)).toBeLessThan(0.01);
  });
});

// ============================================================
// VERIFICAÇÃO DE PRECISÃO DECIMAL
// ============================================================
//
// Garantir que cada etapa intermédia tem precisão total (não truncada)

describe("Audit: Precisão decimal em cadeia", () => {
  it("fob é exactamente o valor de entrada sem perda", () => {
    const r = calculateCustoms({
      fob: 12345.67,
      freightDeclaredOnInvoice: false,
      exchangeRate: 63.2,
      categoryId: "g_construcao",
      clearanceType: "normal",
    });
    expect(r.fob).toBe(12345.67);
  });

  it("frete é FOB × 0.1 sem truncatura", () => {
    const r = calculateCustoms({
      fob: 12345.67,
      freightDeclaredOnInvoice: false,
      exchangeRate: 63.2,
      categoryId: "g_construcao",
      clearanceType: "normal",
    });
    expect(r.freight).toBe(1234.567);
  });

  it("seguro = (FOB + frete) × 0.02 sem truncatura", () => {
    const r = calculateCustoms({
      fob: 12345.67,
      freightDeclaredOnInvoice: false,
      exchangeRate: 63.2,
      categoryId: "g_construcao",
      clearanceType: "normal",
    });
    // (12345.67 + 1234.567) × 0.02 = 13580.237 × 0.02 = 271.60474
    expect(r.insurance).toBeCloseTo(271.60474, 10);
  });

  it("NÚMERO COMPLETO: cadeia inteira com FOB = 12345.67", () => {
    const r = calculateCustoms({
      fob: 12345.67,
      freightDeclaredOnInvoice: false,
      exchangeRate: 63.2,
      categoryId: "g_construcao",
      clearanceType: "normal",
    });

    // Frete = 1234.567
    // Seguro = (12345.67 + 1234.567) × 0.02 = 271.60474
    // CIF = 12345.67 + 1234.567 + 271.60474 = 13851.84174
    // CIF MT = 13851.84174 × 63.2 = 875436.397968
    // D.A. = 875436.397968 × 0.075 = 65657.7298476
    // IVA = (875436.397968 + 65657.7298476) × 0.16 = 941094.1278156 × 0.16 = 150575.060450496
    // Impostos = 65657.7298476 + 150575.060450496 = 216232.790298096
    // Total = 875436.397968 + 216232.790298096 + 2500 = 1 094 169.188266096

    const cif = 13851.84174;
    const cifMt = cif * 63.2;
    const da = cifMt * 0.075;
    const iva = (cifMt + da) * 0.16;
    const totalTaxes = da + iva;
    const total = cifMt + totalTaxes + 2500;

    expect(Math.abs(r.cif - cif)).toBeLessThan(1e-9);
    expect(Math.abs(r.cifMt - cifMt)).toBeLessThan(1e-9);
    expect(Math.abs(r.da - da)).toBeLessThan(1e-9);
    expect(Math.abs(r.iva - iva)).toBeLessThan(1e-9);
    expect(Math.abs(r.totalTaxes - totalTaxes)).toBeLessThan(1e-6);
    expect(Math.abs(r.total - total)).toBeLessThan(1e-6);
  });
});

// ============================================================
// VERIFICAÇÃO DE ORDEM DE CÁLCULO
// ============================================================
//
// O documento especifica ordem obrigatória:
// FOB → Frete → Seguro → CIF → CIF MT → D.A. → ICE → IVA → Sobretaxa → Taxas → Total
//
// Se o IVA fosse calculado antes do ICE, o resultado seria diferente
// (IVA não incluiria ICE na base).
// Se a Sobretaxa fosse calculada a partir de CIF MT em vez de CIF,
// matematicamente seria igual, mas conceptualmente diferente.

describe("Audit: Ordem de cálculo (IVA depende de ICE)", () => {
  it("IVA usa (CIF MT + D.A. + ICE) — se ICE fosse omitido, IVA seria menor", () => {
    // Categoria com ICE: automóveis gasolina >1500cc (ICE 30%)
    const r = calculateCustoms({
      fob: 20000,
      freightDeclaredOnInvoice: false,
      exchangeRate: 63.2,
      categoryId: "v_gas_1500_plus",
      clearanceType: "normal",
    });

    // Calcular manualmente
    const freight = 20000 * 0.1;
    const insurance = (20000 + freight) * 0.02;
    const cif = 20000 + freight + insurance;
    const cifMt = cif * 63.2;
    const da = cifMt * 0.2;
    const ice = cifMt * 0.3;
    const iva = (cifMt + da + ice) * 0.16;

    // IVA sem ICE seria diferente
    const ivaSemIce = (cifMt + da) * 0.16;
    expect(iva).toBeGreaterThan(ivaSemIce);
    expect(iva - ivaSemIce).toBeCloseTo(ice * 0.16, 9);

    // Verificar que o motor segue a ordem correcta
    expect(Math.abs(r.iva - iva)).toBeLessThan(0.01);
    expect(Math.abs(r.iva - ivaSemIce)).toBeGreaterThan(0.01);
  });
});

// ============================================================
// VERIFICAÇÃO DE CATEGORIA SEM IVA
// ============================================================

describe("Audit: Categoria sem IVA (Diesel ≤5t)", () => {
  it("v_merc_diesel_5t não tem IVA segundo o documento", () => {
    const r = calculateCustoms({
      fob: 30000,
      freightDeclaredOnInvoice: false,
      exchangeRate: 63.2,
      categoryId: "v_merc_diesel_5t",
      clearanceType: "normal",
    });
    expect(r.iva).toBe(0);
    expect(r.da).toBeGreaterThan(0);
    // Total = CIF MT + D.A. + Taxa (sem IVA nem ICE)
    const expectedTotal = r.cifMt + r.da + 2500;
    expect(Math.abs(r.total - expectedTotal)).toBeLessThan(0.01);
  });
});
