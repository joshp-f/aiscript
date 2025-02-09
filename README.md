# AIScript

AIScript is a compiler from human language to code.

Unlike Cursor or Copilot, AIScript separates AI code from human code, just like a compiler separates binary from application code.

This means you don’t need to read confusing AI code. Instead, focus on  communicating your goal in english.

Example:
```tsx
{/* PortfolioWrapper is a sleek modern ux container for the portfolio. It must span the entire page top to bottom */}
<AIC.PortfolioWrapperV4>
  {/* PorfolioTitle must be a sleek, modern, well sized title with large and modern font - 'josh dir'. */}
  <AIC.PortfolioTitle />
  {/* ProjectsGrid is a sleek modern container for the projects. It is a 3 column grid that stretches the screen. It takes children as props. */}
  <AIC.ProjectsGridV4>
    {sites.map(site => {
      /* ProjectItem is a sleek, modern item to show off each project to each user.
      It has a clearly visible rounded and thick border, large colorful text with a modern font.
      Each project button should have its own background color coordinating with text color
      All border colors should be the same
      All boxes should be the same */
      return <AIC.ProjectItemV5 site={site} />
    })}
  </AIC.ProjectsGridV4>
</AIC.PortfolioWrapperV4>
```
This AIScript compiled into the website https://blog.aitida.com/


```bash
npx @aitida/aiscript
```
Run this in root of your project to start compiling!
## Features

- 📝 TypeScript and JavaScript support
- ⚛️ React and Vue.js support
- 🎯 Next.js compatible
- ⚡️ Separates AI code from human code

## Prerequisites

You'll need an Anthropic API key to use AIScript. You can get one at [Anthropic's website](https://console.anthropic.com/settings/keys).

Set your API key as an environment variable:

```bash
export ANTHROPIC_API_KEY='your-key-here'
```

## Usage

1. In your React components, use the `AIC` namespace to indicate where you want AI-generated components:

```tsx
// React/Next.js Example (TypeScript)
import { AIC } from './aiscript';

function App() {
  return (
    <div>
      <h1>My App</h1>
        {/* The Product Card component is beige with rounded borders, extremely clean and modern design*/}
      <AIC.ProductCard 
        title="Amazing Product" 
        price={99.99} 
      />
    </div>
  );
}
```

```vue
<!-- Vue 3 Example -->
<template>
  <div>
    <h1>My App</h1>
    <!-- The Product Card component is beige with rounded borders, extremely clean and modern design -->
    <AIC.ProductCard 
      title="Amazing Product"
      :price="99.99"
    />
  </div>
</template>

<script>
import { AIC } from './aiscript'
```

2. Run AIScript in your project root:

```bash
npx @aitida/aiscript
```

3. AIScript will:
   - Create an `src/aiscript` directory if it doesn't exist
   - Generate `src/aiscript/ProductCard.tsx` with a complete implementation
   - Use the context from your usage to inform the component's design

## How It Works

1. AIScript scans your project for any components using the `AIC.ComponentName` pattern
2. For each component it finds, it:
   - Reads the file where the component is used
   - Analyzes the usage context
   - Generates a TypeScript React component that matches the usage
   - Saves it in the `src/aiscript` directory

## Example

If you have this code:

```tsx
function ProductPage() {
  return (
    <main>
      <AIC.ProductGrid
        products={[
          { id: 1, name: 'Widget', price: 19.99 },
          { id: 2, name: 'Gadget', price: 29.99 }
        ]}
        onProductClick={(id) => console.log('Clicked:', id)}
      />
    </main>
  );
}
```

Running `npx aiscript` will create `src/aiscript/productgrid.tsx` with a fully implemented grid component that:
- Accepts products array and click handler props
- Includes proper TypeScript types
- Follows React best practices

## Tips

- Components are only generated if they don't already exist, saving llm costs.
- You can safely run `aiscript` multiple times. If you want to recreate a component,  rename it slightly.
- Commit your src/aiscript folder just like you would ordinary code
- Component generation is based on how you use them in your code. Add comments next to components to control them

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. We want to roll out support for as many languages and toolchains as possible.

## License

MIT