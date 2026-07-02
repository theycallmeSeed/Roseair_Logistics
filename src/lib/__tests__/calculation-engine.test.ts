import { describe, it, expect } from "vitest";
import { calculateCustoms } from "../calculation-engine";
import type { ClearanceType } from "../customs-categories";

const clearanceNormal: ClearanceType = "normal";

function baseInput(overrides?: Record<string, unknown>) {
  return {
    fob: 10000,
    freightDeclaredOnInvoice: false,
    exchangeRate: 63.2,
    categoryId: "g_construcao",
    clearanceType: clearanceNormal as ClearanceType,
    ...overrides,
  } as const;
}

// ============================================================
// 1. FOB, Frete, Seguro, CIF, CIF MT
// ============================================================

describe("Dados Iniciais (base de cálculo)", () => {
  it("FOB é o valor de entrada", () => {
    const r = calculateCustoms(baseInput({ fob: 15000 }));
    expect(r.fob).toBe(15000);
  });

  it("Frete = FOB × 10% quando não declarado na factura", () => {
    const r = calculateCustoms(baseInput({ fob: 10000, freightDeclaredOnInvoice: false }));
    expect(r.freight).toBe(1000);
  });

  it("Frete = valor declarado quando declarado na factura", () => {
    const r = calculateCustoms(
      baseInput({ fob: 10000, freightDeclaredOnInvoice: true, freightValue: 500 }),
    );
    expect(r.freight).toBe(500);
  });

  it("Seguro = (FOB + Frete) × 2%", () => {
    const r = calculateCustoms(baseInput({ fob: 10000 }));
    // freight = 1000 (10%), seguro = (10000 + 1000) × 0.02 = 220
    expect(r.insurance).toBeCloseTo(220, 10);
  });

  it("CIF = FOB + Frete + Seguro", () => {
    const r = calculateCustoms(baseInput({ fob: 10000 }));
    expect(r.cif).toBeCloseTo(10000 + 1000 + 220, 10);
  });

  it("CIF MT = CIF × Câmbio", () => {
    const r = calculateCustoms(baseInput({ fob: 10000, exchangeRate: 63.2 }));
    expect(r.cifMt).toBeCloseTo(11220 * 63.2, 10);
  });
});

// ============================================================
// 2. Impostos — Caso Completo
// ============================================================

describe("Impostos — Material de construção", () => {
  const r = calculateCustoms(
    baseInput({
      fob: 20000,
      freightDeclaredOnInvoice: false,
      exchangeRate: 63.2,
      categoryId: "g_construcao",
    }),
  );

  it("D.A. = CIF MT × 7.5%", () => {
    const cifMt = r.cifMt;
    expect(r.cif).toBeCloseTo(20000 + 2000 + 440, 10); // 22440
    expect(cifMt).toBeCloseTo(22440 * 63.2, 10); // 1,418,208
    expect(r.da).toBeCloseTo(cifMt * 0.075, 10);
  });

  it("ICE = 0 (não aplicável a carga geral)", () => {
    expect(r.ice).toBe(0);
  });

  it("IVA = (CIF MT + D.A. + ICE) × 16%", () => {
    const base = r.cifMt + r.da + r.ice;
    expect(r.iva).toBeCloseTo(base * 0.16, 10);
  });

  it("Sobretaxa = 0 (não definida nas categorias actuais)", () => {
    expect(r.sobretaxa).toBe(0);
  });

  it("Total = CIF MT + D.A. + ICE + IVA + Sobretaxa + Fee", () => {
    const expected = r.cifMt + r.da + r.ice + r.iva + r.sobretaxa + r.fee;
    expect(Math.abs(r.total - expected)).toBeLessThan(0.01);
  });

  it("Total Taxes = D.A. + ICE + IVA + Sobretaxa", () => {
    expect(r.totalTaxes).toBeCloseTo(r.da + r.ice + r.iva + r.sobretaxa, 10);
  });
});

// ============================================================
// 3. Todas as Categorias de Carga Geral (5)
// ============================================================

const GENERAL_IDS = [
  { id: "g_construcao", da: 0.075, iva: 0.16 },
  { id: "g_eletrico", da: 0.075, iva: 0.16 },
  { id: "g_mobilia", da: 0.2, iva: 0.16 },
  { id: "g_maquinas", da: 0.05, iva: 0.16 },
  { id: "g_textil", da: 0.2, iva: 0.16 },
];

describe.each(GENERAL_IDS)("Carga Geral: $id", ({ id, da, iva }) => {
  const r = calculateCustoms(baseInput({ fob: 30000, categoryId: id }));

  it(`D.A. = CIF MT × ${da * 100}%`, () => {
    expect(r.da).toBeCloseTo(r.cifMt * da, 10);
  });

  it("ICE = 0", () => {
    expect(r.ice).toBe(0);
  });

  it(`IVA = (CIF MT + D.A.) × ${iva * 100}%`, () => {
    expect(r.iva).toBeCloseTo((r.cifMt + r.da) * iva, 10);
  });
});

// ============================================================
// 4. Todos os Tipos de Veículos (18)
// ============================================================

const VEHICLE_IDS = [
  { id: "v_pass_diesel_10", da: 0.05, ice: 0, iva: 0.16 },
  { id: "v_pass_gas_10", da: 0.05, ice: 0.3, iva: 0.16 },
  { id: "v_gas_1000", da: 0.2, ice: 0.05, iva: 0.16 },
  { id: "v_gas_1500", da: 0.2, ice: 0.1, iva: 0.16 },
  { id: "v_gas_1500_plus", da: 0.2, ice: 0.3, iva: 0.16 },
  { id: "v_diesel_1500", da: 0.2, ice: 0.1, iva: 0.16 },
  { id: "v_diesel_1500_plus", da: 0.2, ice: 0.3, iva: 0.16 },
  { id: "v_hibridos", da: 0.2, ice: 0.3, iva: 0.16 },
  { id: "v_merc_diesel_5t", da: 0.05, ice: 0, iva: 0 },
  { id: "v_merc_diesel_5t_plus", da: 0.05, ice: 0, iva: 0.16 },
  { id: "v_merc_diesel_est", da: 0.05, ice: 0, iva: 0.16 },
  { id: "v_merc_diesel_dupla", da: 0.05, ice: 0.3, iva: 0.16 },
  { id: "v_merc_gas_5t", da: 0.05, ice: 0, iva: 0.16 },
  { id: "v_merc_gas_5t_plus", da: 0.05, ice: 0, iva: 0.16 },
  { id: "v_merc_gas_est", da: 0.05, ice: 0, iva: 0.16 },
  { id: "v_merc_gas_dupla", da: 0.05, ice: 0.3, iva: 0.16 },
  { id: "v_merc_hibridas", da: 0.05, ice: 0, iva: 0.16 },
  { id: "v_especiais", da: 0.05, ice: 0, iva: 0.16 },
];

describe.each(VEHICLE_IDS)("Veículos: $id", ({ id, da, ice, iva }) => {
  const r = calculateCustoms(baseInput({ fob: 25000, categoryId: id }));

  it(`D.A. = CIF MT × ${da * 100}%`, () => {
    expect(r.da).toBeCloseTo(r.cifMt * da, 10);
  });

  it(`ICE = CIF MT × ${ice * 100}%${ice === 0 ? " (não aplicável)" : ""}`, () => {
    expect(r.ice).toBeCloseTo(r.cifMt * ice, 10);
  });

  if (iva > 0) {
    it(`IVA = (CIF MT + D.A. + ICE) × ${iva * 100}%`, () => {
      expect(r.iva).toBeCloseTo((r.cifMt + r.da + r.ice) * iva, 10);
    });
  } else {
    it("IVA = 0 (não aplicável)", () => {
      expect(r.iva).toBe(0);
    });
  }
});

// ============================================================
// 5. Taxas Administrativas (Fee)
// ============================================================

describe("Taxas Administrativas", () => {
  it("Normal = 2500 MZN", () => {
    const r = calculateCustoms(baseInput({ clearanceType: "normal" as ClearanceType }));
    expect(r.fee).toBe(2500);
  });

  it("Expresso = 7500 MZN", () => {
    const r = calculateCustoms(baseInput({ clearanceType: "expresso" as ClearanceType }));
    expect(r.fee).toBe(7500);
  });

  it("Prioritário = 15000 MZN", () => {
    const r = calculateCustoms(baseInput({ clearanceType: "prioritario" as ClearanceType }));
    expect(r.fee).toBe(15000);
  });
});

// ============================================================
// 6. Casos-limite (fronteira)
// ============================================================

describe("Casos-limite", () => {
  it("cilindrada exactamente 1000cc usa categoria até 1000cc", () => {
    const r = calculateCustoms(baseInput({ categoryId: "v_gas_1000" }));
    expect(r.ice).toBeGreaterThan(0);
  });

  it("cilindrada exactamente 1500cc usa categoria 1000–1500", () => {
    const r = calculateCustoms(baseInput({ categoryId: "v_gas_1500" }));
    expect(r.ice).toBeGreaterThan(0);
  });

  it("Veículos mercadorias diesel até 5t não tem IVA", () => {
    const r = calculateCustoms(baseInput({ categoryId: "v_merc_diesel_5t" }));
    expect(r.iva).toBe(0);
    expect(r.da).toBeGreaterThan(0);
  });
});

// ============================================================
// 7. Input inválido
// ============================================================

describe("Input inválido", () => {
  it("lança erro para categoria desconhecida", () => {
    expect(() => calculateCustoms(baseInput({ categoryId: "categoria_invalida" }))).toThrow(
      "Categoria desconhecida",
    );
  });
});

// ============================================================
// 8. Consistência (freight declarado vs não declarado)
// ============================================================

describe("Consistência frete declarado vs não declarado", () => {
  it("freightValue é ignorado quando freightDeclaredOnInvoice é false", () => {
    const r = calculateCustoms(
      baseInput({ fob: 10000, freightDeclaredOnInvoice: false, freightValue: 99999 }),
    );
    expect(r.freight).toBeCloseTo(1000, 10);
  });

  it("mesmo FOB, mesmo resultado com e sem declaração se freightValue = 10%", () => {
    const r1 = calculateCustoms(baseInput({ fob: 10000, freightDeclaredOnInvoice: false }));
    const r2 = calculateCustoms(
      baseInput({ fob: 10000, freightDeclaredOnInvoice: true, freightValue: 1000 }),
    );
    expect(r1.cif).toBeCloseTo(r2.cif, 10);
  });
});
