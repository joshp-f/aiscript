# AIScript

AIScript is a CLI tool that automatically generates React components using Claude AI. It scans your React project for component placeholders and creates the corresponding components based on their usage context. It is a first attempt at an AI powered programming language.

## Features

- 🤖 Declerative, AI-powered component generation
- 📝 TypeScript and JavaScript support
- ⚛️ React and Vue.js support
- 🎯 Next.js compatible
- 🔍 Automatic component discovery
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
<!-- Vue Example -->
<template>
  <div>
    <h1>My App</h1>
    <!-- The Product Card component is beige with rounded borders, extremely clean and modern design -->
    <AIC-ProductCard 
      title="Amazing Product"
      :price="99.99"
    />
  </div>
</template>

<script>
import { AIC } from './aiscript'

export default {
  components: {
    'AIC-ProductCard': AIC.ProductCard
  }
}
```

2. Run AIScript in your project root:

```bash
npx aiscript
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