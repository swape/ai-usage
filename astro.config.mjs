// @ts-check
import { defineConfig, fontProviders } from 'astro/config'

// https://astro.build/config
export default defineConfig({
	fonts: [
		{
			provider: fontProviders.google(),
			name: 'Inter',
			cssVariable: '--font-body',
			weights: [400, 600, 700, 800],
			styles: ['normal'],
			fallbacks: ['Avenir Next', 'Avenir', 'Segoe UI', 'sans-serif'],
		},
		{
			provider: fontProviders.google(),
			name: 'DM Serif Display',
			cssVariable: '--font-heading',
			weights: [400],
			styles: ['normal', 'italic'],
			fallbacks: ['Georgia', 'serif'],
		},
	],
})
