# AI Usage

An illustrative environmental-impact calculator for AI text prompts, built with Astro, TypeScript, and plain CSS. Calculations run locally in the browser.

The selectable references include the 2025 [ChatGPT disclosure](https://blog.samaltman.com/the-gentle-singularity), [Gemini Apps research](https://arxiv.org/abs/2508.15734), [Mistral Large 2 assessment](https://mistral.ai/news/our-contribution-to-a-global-environmental-standard-for-ai), and BLOOM and LLaMA energy figures summarized in Google's research. Mistral provides water only for this calculator; BLOOM and LLaMA provide energy only. Missing metrics are shown as unavailable, not zero. The references use different methods and are not directly comparable or measurements of your usage.

Available energy estimates are converted to an illustrative carbon proxy using the US EPA's 2022 average electricity factor; driving and urban-tree comparisons also use [EPA equivalencies](https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator-calculations-and-references). Results are not a full lifecycle assessment; see the page for assumptions and limitations.

Food comparisons use an assumed 40 g bread slice and 330 mL beer, based on a single [cradle-to-gate study](https://pmc.ncbi.nlm.nih.gov/articles/PMC13163583/) of conventional baguette (0.56 kg CO₂e/kg) and beer (0.771 kg CO₂e/litre). The 100 g beef burger patty comparison excludes bun, toppings and cooking and uses the [global beef-herd average](https://ourworldindata.org/grapher/ghg-per-kg-poore) of 99.48 kg CO₂e/kg. These food footprints include other greenhouse gases and have broader boundaries than the electricity-only CO₂ proxy; comparisons are illustrative, not measurements or offsets.

The daily, monthly and yearly comparison assumes steady usage and a 365-day year divided into 12 equal months; prompt counts and impacts are averages, not calendar-specific totals.

## Getting started

Use Node.js 22.23.4 or newer, then run:

```sh
npm install
npm run dev
```

Open the local URL printed by Astro.

## Commands

- `npm run dev` starts the development server.
- `npm run build` builds the site into `dist/`.
- `npm run preview` previews the production build.
- `npm run check` checks Astro and TypeScript files.
- `npm test` runs the calculation tests.
- `npm run format` formats the code with Prettier (no semicolons, single quotes, tabs).
- `npm run format:check` checks formatting without changing files.

## Project structure

- `src/pages/index.astro` is the single page; it assembles the section components.
- `src/components/` contains one Astro component per page section: header, hero, input panel, results, period results, methodology and footer.
- `src/styles/global.css` contains plain CSS.
- `src/lib/impact.ts` contains the calculation and published assumptions.
- `src/types.ts` contains the shared TypeScript types.
- `src/scripts/calculator.ts` handles the browser form.
- `test/` contains the calculation tests.
- `public/` contains static assets.
- `tsconfig.json` configures strict TypeScript support.
- `.prettierrc.json` configures Prettier.

See the [Astro documentation](https://docs.astro.build/) for more information.
