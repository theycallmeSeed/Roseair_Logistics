export type Currency = "USD" | "MZN" | "ZAR";

export type ClearanceType = "normal" | "expresso" | "prioritario";

export type CategoryGroup = "geral" | "veiculos";

export interface TaxCategory {
  id: string;
  group: CategoryGroup;
  label: string;
  da: number;
  ice?: number;
  iva?: number;
  /**
   * Valor mínimo de ICE em MZN, conforme nota do documento oficial:
   * "nos veiculos temos os valor minimos dos ICEs de acordo com cada tipo de veiculos"
   *
   * Pendente de confirmação pela Roseair — os valores actuais são null (desconhecido).
   * Quando definido, o cálculo será ICE = max(CIF_MT × taxa, minIce).
   */
  minIce?: number | null;
}

function gen(id: string, label: string, da: number, iva: number): TaxCategory {
  return { id, group: "geral", label, da, iva };
}

function vei(
  id: string,
  label: string,
  da: number,
  ice: number | undefined,
  iva: number | undefined,
): TaxCategory {
  return { id, group: "veiculos", label, da, ice, iva, minIce: null };
}

export const TAX_CATEGORIES: TaxCategory[] = [
  // ===== Carga Geral (5 categorias) =====
  gen("g_construcao", "Material de construção", 0.075, 0.16),
  gen("g_eletrico", "Material elétrico", 0.075, 0.16),
  gen("g_mobilia", "Mobília e móveis", 0.2, 0.16),
  gen("g_maquinas", "Máquinas e equipamentos", 0.05, 0.16),
  gen("g_textil", "Material têxtil (vestuário, tecidos, calçados, bolsas/malas, etc.)", 0.2, 0.16),

  // ===== Veículos (18 tipos) =====
  vei("v_pass_diesel_10", "Transporte de passageiros (10+) – Diesel", 0.05, undefined, 0.16),
  vei("v_pass_gas_10", "Transporte de passageiros (10+) – Gasolina", 0.05, 0.3, 0.16),
  vei("v_gas_1000", "Automóveis passageiros gasolina até 1000cm³", 0.2, 0.05, 0.16),
  vei("v_gas_1500", "Automóveis passageiros gasolina 1000cm³–1500cm³", 0.2, 0.1, 0.16),
  vei("v_gas_1500_plus", "Automóveis passageiros gasolina acima de 1500cm³", 0.2, 0.3, 0.16),
  vei("v_diesel_1500", "Automóveis passageiros diesel até 1500cm³", 0.2, 0.1, 0.16),
  vei("v_diesel_1500_plus", "Automóveis passageiros diesel acima de 1500cm³", 0.2, 0.3, 0.16),
  vei("v_hibridos", "Veículos passageiros híbridos (gasolina/diesel + elétrico)", 0.2, 0.3, 0.16),
  vei(
    "v_merc_diesel_5t",
    "Veículos mercadorias (Diesel) até 5 toneladas",
    0.05,
    undefined,
    undefined,
  ),
  vei(
    "v_merc_diesel_5t_plus",
    "Veículos mercadorias (Diesel) acima de 5 toneladas",
    0.05,
    undefined,
    0.16,
  ),
  vei(
    "v_merc_diesel_est",
    "Veículos mercadorias (Diesel) – Cabine estendida",
    0.05,
    undefined,
    0.16,
  ),
  vei(
    "v_merc_diesel_dupla",
    "Veículos mercadorias (Diesel) – Cabine dupla e caixa aberta",
    0.05,
    0.3,
    0.16,
  ),
  vei("v_merc_gas_5t", "Veículos mercadorias (Gasolina) até 5 toneladas", 0.05, undefined, 0.16),
  vei(
    "v_merc_gas_5t_plus",
    "Veículos mercadorias (Gasolina) acima de 5 toneladas",
    0.05,
    undefined,
    0.16,
  ),
  vei(
    "v_merc_gas_est",
    "Veículos mercadorias (Gasolina) – Cabine estendida",
    0.05,
    undefined,
    0.16,
  ),
  vei(
    "v_merc_gas_dupla",
    "Veículos mercadorias (Gasolina) – Cabine dupla e caixa aberta",
    0.05,
    0.3,
    0.16,
  ),
  vei(
    "v_merc_hibridas",
    "Veículos mercadorias híbridos (gasolina/diesel + elétrico)",
    0.05,
    undefined,
    0.16,
  ),
  vei("v_especiais", "Veículos especiais", 0.05, undefined, 0.16),
];

export function findCategory(id: string): TaxCategory | undefined {
  return TAX_CATEGORIES.find((c) => c.id === id);
}

export function categoriesByGroup(group: CategoryGroup): TaxCategory[] {
  return TAX_CATEGORIES.filter((c) => c.group === group);
}

export const CLEARANCE_FEES: Record<ClearanceType, number> = {
  normal: 2500,
  expresso: 7500,
  prioritario: 15000,
};

export const CLEARANCE_LABELS: Record<ClearanceType, string> = {
  normal: "Normal",
  expresso: "Expresso",
  prioritario: "Prioritário",
};
