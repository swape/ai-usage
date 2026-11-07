import type {
	Estimate,
	ImpactResult,
	Period,
	PeriodFactors,
	Profile,
} from '../types.ts'

export const estimates: Record<Profile, Estimate> = {
	chatgpt: {
		label: 'ChatGPT — average query (2025)',
		energyWh: 0.34,
		waterLitres: 0.000085 * 3.785411784,
	},
	gemini: {
		label: 'Gemini Apps — median text prompt (2025)',
		energyWh: 0.24,
		waterLitres: 0.00026,
	},
	mistral: {
		label: 'Mistral Large 2 — 400-token response (2025, water only)',
		energyWh: null,
		waterLitres: 0.045,
	},
	bloom: {
		label: 'BLOOM — average query (2022, energy only)',
		energyWh: 4,
		waterLitres: null,
	},
	llama: {
		label: 'LLaMA 65B — benchmark response (2023, energy only)',
		energyWh: 0.3,
		waterLitres: null,
	},
}

const daysPerPeriod: Record<Period, number> = {
	day: 1,
	month: 365 / 12,
	year: 365,
}

const MAX_PROMPTS = 1_000_000_000
export const INVALID_PROMPTS_MESSAGE =
	'Enter a whole number between 0 and 1,000,000,000.'

// Conversion constants for the everyday comparisons.
const CARBON_G_PER_KWH = 394
const KWH_PER_BULB_HOUR = 0.01
const LITRES_PER_CUP = 0.25
const CAR_G_PER_KM = 393 / 1.609344
const TREE_G_PER_DAY = 60_500 / 365
const BREAD_G_PER_SLICE = 560 * 0.04
const BURGER_G_PER_PATTY = 99_480 * 0.1
const BEER_G_PER_GLASS = 771 * 0.33

export function isProfile(value: string): value is Profile {
	return Object.hasOwn(estimates, value)
}

export function isPeriod(value: string): value is Period {
	return Object.hasOwn(daysPerPeriod, value)
}

export function isValidPromptCount(prompts: number): boolean {
	return Number.isSafeInteger(prompts) && prompts >= 0 && prompts <= MAX_PROMPTS
}

/** Multipliers that rescale a per-`period` figure to a per-day, per-month and per-year one. */
export function periodFactors(period: Period): PeriodFactors {
	const days = daysPerPeriod[period]
	return {
		day: daysPerPeriod.day / days,
		month: daysPerPeriod.month / days,
		year: daysPerPeriod.year / days,
	}
}

export function calculateImpact(
	profile: Profile,
	prompts: number,
): ImpactResult {
	if (!isValidPromptCount(prompts))
		throw new RangeError(INVALID_PROMPTS_MESSAGE)

	const { energyWh, waterLitres: waterPerPrompt } = estimates[profile]
	const energyKwh = energyWh === null ? null : (prompts * energyWh) / 1000
	const waterLitres = waterPerPrompt === null ? null : prompts * waterPerPrompt
	const carbonGrams = energyKwh === null ? null : energyKwh * CARBON_G_PER_KWH

	return {
		energyKwh,
		waterLitres,
		cups: waterLitres === null ? null : waterLitres / LITRES_PER_CUP,
		bulbHours: energyKwh === null ? null : energyKwh / KWH_PER_BULB_HOUR,
		carKilometres: carbonGrams === null ? null : carbonGrams / CAR_G_PER_KM,
		treeDays: carbonGrams === null ? null : carbonGrams / TREE_G_PER_DAY,
		bread: carbonGrams === null ? null : carbonGrams / BREAD_G_PER_SLICE,
		burger: carbonGrams === null ? null : carbonGrams / BURGER_G_PER_PATTY,
		beer: carbonGrams === null ? null : carbonGrams / BEER_G_PER_GLASS,
		carbonGrams,
	}
}
