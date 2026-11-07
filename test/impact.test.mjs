import test from 'node:test'
import assert from 'node:assert/strict'
import {
	calculateImpact,
	isPeriod,
	isProfile,
	periodFactors,
} from '../src/lib/impact.ts'

test('calculates ChatGPT energy, water and comparisons for 100 prompts', () => {
	const result = calculateImpact('chatgpt', 100)
	assert.ok(Math.abs(result.energyKwh - 0.034) < 1e-12)
	assert.ok(Math.abs(result.waterLitres - 0.032176000164) < 1e-12)
	assert.ok(Math.abs(result.carbonGrams - 13.396) < 1e-12)
	assert.ok(Math.abs(result.bulbHours - 3.4) < 1e-12)
	assert.ok(Math.abs(result.carKilometres - 13.396 / (393 / 1.609344)) < 1e-12)
	assert.ok(Math.abs(result.treeDays - 13.396 / (60500 / 365)) < 1e-12)
	assert.ok(Math.abs(result.bread - 13.396 / 22.4) < 1e-12)
	assert.ok(Math.abs(result.burger - 13.396 / 9948) < 1e-12)
	assert.ok(Math.abs(result.beer - 13.396 / 254.43) < 1e-12)
})

test('uses the Gemini estimate and handles zero', () => {
	assert.ok(
		Math.abs(calculateImpact('gemini', 1000).waterLitres - 0.26) < 1e-12,
	)
	assert.equal(calculateImpact('gemini', 1000).energyKwh, 0.24)
	assert.equal(calculateImpact('gemini', 0).carbonGrams, 0)
	for (const food of ['bread', 'burger', 'beer'])
		assert.equal(calculateImpact('gemini', 0)[food], 0)
})

test('rejects invalid counts and profile names', () => {
	for (const amount of [-1, 1.5, NaN, Infinity, 1_000_000_001]) {
		assert.throws(() => calculateImpact('chatgpt', amount), RangeError)
	}
	assert.equal(isProfile('gemini'), true)
	assert.equal(isProfile('toString'), false)
})

test('calculates partial references without inventing missing metrics', () => {
	const mistral = calculateImpact('mistral', 100)
	assert.equal(mistral.waterLitres, 4.5)
	assert.equal(mistral.cups, 18)
	assert.equal(mistral.energyKwh, null)
	assert.equal(mistral.carbonGrams, null)
	assert.equal(mistral.carKilometres, null)
	assert.equal(mistral.treeDays, null)
	for (const food of ['bread', 'burger', 'beer']) {
		assert.equal(mistral[food], null)
		assert.equal(calculateImpact('mistral', 0)[food], null)
	}
	assert.equal(mistral.bulbHours, null)
	for (const [profile, expectedEnergy] of [
		['bloom', 0.4],
		['llama', 0.03],
	]) {
		const result = calculateImpact(profile, 100)
		assert.ok(Math.abs(result.energyKwh - expectedEnergy) < 1e-12)
		assert.equal(result.waterLitres, null)
		assert.equal(result.cups, null)
		assert.ok(Math.abs(result.carbonGrams - expectedEnergy * 394) < 1e-12)
	}
	assert.equal(calculateImpact('bloom', 0).waterLitres, null)
})

test('converts usage consistently across daily, monthly and yearly averages', () => {
	const periods = [
		['day', 12, [1, 365 / 12, 365]],
		['month', 365, [12 / 365, 1, 12]],
		['year', 4380, [1 / 365, 1 / 12, 1]],
	]
	for (const [period, prompts, expected] of periods) {
		const factors = periodFactors(period)
		Object.values(factors).forEach((factor, index) =>
			assert.ok(Math.abs(factor - expected[index]) < 1e-12),
		)
		const impact = calculateImpact('gemini', prompts)
		assert.ok(Math.abs(impact.energyKwh * factors.day - 0.00024 * 12) < 1e-12)
		assert.ok(
			Math.abs(impact.energyKwh * factors.month - 0.00024 * 365) < 1e-12,
		)
		assert.ok(
			Math.abs(impact.energyKwh * factors.year - 0.00024 * 4380) < 1e-12,
		)
		for (const food of ['bread', 'burger', 'beer']) {
			assert.ok(
				Math.abs(
					impact[food] * factors.year - calculateImpact('gemini', 4380)[food],
				) < 1e-12,
			)
		}
	}
	assert.equal(isPeriod('day'), true)
	assert.equal(isPeriod('toString'), false)
})
