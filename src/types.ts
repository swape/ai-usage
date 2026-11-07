export type Profile = 'chatgpt' | 'gemini' | 'mistral' | 'bloom' | 'llama'
export type Period = 'day' | 'month' | 'year'

/** Per-prompt reference figures; `null` means the source did not report that metric. */
export interface Estimate {
	label: string
	energyWh: number | null
	waterLitres: number | null
}

export type PeriodFactors = Record<Period, number>

export interface ImpactResult {
	energyKwh: number | null
	waterLitres: number | null
	cups: number | null
	bulbHours: number | null
	carKilometres: number | null
	treeDays: number | null
	bread: number | null
	burger: number | null
	beer: number | null
	carbonGrams: number | null
}
