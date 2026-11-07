import {
	calculateImpact,
	estimates,
	INVALID_PROMPTS_MESSAGE,
	isPeriod,
	isProfile,
	isValidPromptCount,
	periodFactors,
} from '../lib/impact'
import type { ImpactResult } from '../types'

const form = document.querySelector<HTMLFormElement>('#calculator')
const profile = document.querySelector<HTMLSelectElement>('#profile')
const amount = document.querySelector<HTMLInputElement>('#amount')
const period = document.querySelector<HTMLSelectElement>('#period')
const error = document.querySelector<HTMLElement>('#error')
const results = document.querySelector<HTMLElement>('#results')
const periodResults = document.querySelector<HTMLElement>('#period-results')

if (
	!form ||
	!profile ||
	!amount ||
	!period ||
	!error ||
	!results ||
	!periodResults
) {
	throw new Error('Calculator controls are missing.')
}

const controls = {
	form,
	profile,
	amount,
	period,
	error,
	results,
	periodResults,
}
const formatter = new Intl.NumberFormat('en', { maximumSignificantDigits: 3 })
const countFormatter = new Intl.NumberFormat('en')

const EMPTY = '—'
const PROMPT_FALLBACK_MESSAGE = 'Enter valid information to see your estimate.'

// Output element id -> field of the calculated result.
const resultFields = {
	water: 'waterLitres',
	cups: 'cups',
	energy: 'energyKwh',
	bulb: 'bulbHours',
	carbon: 'carbonGrams',
	car: 'carKilometres',
	tree: 'treeDays',
	bread: 'bread',
	burger: 'burger',
	beer: 'beer',
} as const satisfies Record<string, keyof ImpactResult>

// Metrics repeated in the per-day/month/year table (prompts are added separately).
const periodMetrics = [
	'water',
	'energy',
	'carbon',
	'tree',
	'bread',
	'burger',
	'beer',
] as const

// Comparisons that are only available when the profile reports energy use.
const energyBasedCategories = [
	'energy',
	'carbon',
	'tree',
	'bread',
	'beer',
	'burger',
]

function setText(id: string, value: string) {
	const element = document.getElementById(id)
	if (!element) throw new Error(`Missing calculator output: ${id}`)
	element.textContent = value
}

function formatValue(value: number | null, factor = 1) {
	return value === null ? EMPTY : formatter.format(value * factor)
}

function showAvailability(category: string, available: boolean) {
	const comparison = document.getElementById(`${category}-comparison`)
	const unavailable = document.getElementById(`${category}-unavailable`)
	if (!comparison || !unavailable)
		throw new Error(`Missing availability message: ${category}`)
	comparison.hidden = !available
	unavailable.hidden = available
}

function clearError() {
	controls.error.hidden = true
	controls.amount.removeAttribute('aria-invalid')
}

function showError(message: string, invalidAmount = false) {
	controls.error.textContent = message
	controls.error.hidden = false
	if (invalidAmount) controls.amount.setAttribute('aria-invalid', 'true')
	clearResults(PROMPT_FALLBACK_MESSAGE)
}

function clearResults(message: string) {
	controls.results.hidden = true
	controls.periodResults.hidden = true
	for (const id of Object.keys(resultFields)) setText(id, EMPTY)
	setText('result-summary', message)
	setText('result-basis', '')
}

function update() {
	const selectedProfile = controls.profile.value
	const selectedPeriod = controls.period.value
	const prompts = controls.amount.valueAsNumber

	clearError()
	if (!isPeriod(selectedPeriod) || !isProfile(selectedProfile)) {
		showError('Choose valid period and estimate options.')
		return
	}
	if (!isValidPromptCount(prompts)) {
		showError(INVALID_PROMPTS_MESSAGE, true)
		return
	}

	const result = calculateImpact(selectedProfile, prompts)
	for (const [id, field] of Object.entries(resultFields))
		setText(id, formatValue(result[field]))

	showAvailability('water', result.waterLitres !== null)
	for (const category of energyBasedCategories)
		showAvailability(category, result.energyKwh !== null)

	setText('period-label', `PER ${selectedPeriod.toUpperCase()}`)
	setText(
		'result-summary',
		`${countFormatter.format(prompts)} ${prompts === 1 ? 'prompt' : 'prompts'} per ${selectedPeriod}.`,
	)
	setText(
		'result-basis',
		`${estimates[selectedProfile].label}. This is a rough reference, not a measurement of your usage.`,
	)

	for (const [target, factor] of Object.entries(
		periodFactors(selectedPeriod),
	)) {
		setText(`${target}-prompts`, formatValue(prompts, factor))
		for (const metric of periodMetrics) {
			setText(
				`${target}-${metric}`,
				formatValue(result[resultFields[metric]], factor),
			)
		}
	}

	controls.results.hidden = false
	controls.periodResults.hidden = false
	controls.results.scrollIntoView({ behavior: 'auto', block: 'start' })
}

function markChanged() {
	clearError()
	clearResults(
		'Inputs changed. Select "See my footprint" to update your estimate.',
	)
}

controls.form.addEventListener('input', markChanged)
controls.form.addEventListener('submit', (event) => {
	event.preventDefault()
	update()
})
