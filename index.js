import { glob } from 'glob';
import fs from 'fs-extra';
import path from 'path';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function findComponentUsages() {
  // Find all TypeScript/JavaScript files except those in node_modules and aiscript folder
//   const files = await glob('src/**/!(node_modules|aiscript)/*.{ts,tsx,js,jsx}');
//   const files = await glob('src/**/!(node_modules|aiscript)/*.{ts,tsx,js,jsx}');
  const files = await glob('./**/*.{ts,tsx,js,jsx}',{ignore:['./node_modules/**','./aiscript/**']});
  const componentUsages = new Map();

  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');
    const matches = content.match(/AIC\.[A-Z][a-zA-Z]*/g);
    
    if (matches) {
      for (const match of matches) {
        const componentName = match.replace('AIC.', '');
        if (!componentUsages.has(componentName)) {
          componentUsages.set(componentName, file);
        }
      }
    }
  }

  return componentUsages;
}


async function generateComponent(componentName, sourceFile) {
    const sourceContent = await fs.readFile(sourceFile, 'utf-8');
    console.log(sourceContent);
    
    const message = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 4000,
      messages: [{
        role: "user",
        content: `You are helping create a React component named ${componentName}. Here is the context where it's being used:
  
  ${sourceContent}
  
  Please create a TypeScript React component that would work well in this context. The component should:
  1. Be exported as default
  2. Include proper TypeScript types
  4. Follow React best practices
  6. Be fully functional based on how it appears to be used in the source file - Absolutely follow any comments around the components use location
  7. The file must be COMPLETELY self contained apart from third party imports, so no .css imports
  
  Return only the component code with no explanation or markdown.`
      }]
    });
  
    const componentCode = message.content[0].text;
    return componentCode;
  }
  
  async function updateIndexFile(aiscriptDir,componentUsages) {
    const componentFiles = await glob(path.join(aiscriptDir, '*.tsx'));

    const validComponents = new Set(componentUsages.keys());

    // Delete components that are no longer referenced
    for (const file of componentFiles) {
        const componentName = path.basename(file, '.tsx');
        if (!validComponents.has(componentName)) {
        console.log(`🗑️ Deleting unused component: ${componentName}`);
        await fs.remove(file);
        }
    }
    const exports = [...validComponents].map(file => {
      const componentName = path.basename(file, '.tsx');
      return `import ${componentName} from './${componentName}';`;
    });
    
    const exportMap = `export const AIC = {
${[...validComponents].map(file => {
      const componentName = path.basename(file, '.tsx');
      return `  ${componentName},`;
    }).join('\n')}
};`;
  
    const indexContent = `${exports.join('\n')}
  
${exportMap}`;
    
    await fs.writeFile(path.join(aiscriptDir, 'index.ts'), indexContent);
  }

  async function main() {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('Error: ANTHROPIC_API_KEY environment variable is required');
      process.exit(1);
    }
  
    console.log('🔍 Scanning for AIC component usages...');

    // Create aiscript directory if it doesn't exist
    const aiscriptDir = path.join(process.cwd(), 'src', 'aiscript');
    await fs.ensureDir(aiscriptDir);
  
    const componentUsages = await findComponentUsages();
    
    if (componentUsages.size === 0) {
      console.log('No AIC component usages found.');
      return;
    }
  
    console.log(`Found ${componentUsages.size} component(s) to process...`);
  
    for (const [componentName, sourceFile] of componentUsages) {
      const componentPath = path.join(aiscriptDir, `${componentName}.tsx`);
      
      if (await fs.pathExists(componentPath)) {
        console.log(`✓ ${componentName} already exists`);
        continue;
      }
  
      console.log(`🤖 Generating ${componentName}...`);
      try {
        const componentCode = await generateComponent(componentName, sourceFile);
        await fs.writeFile(componentPath, componentCode);
        console.log(`✅ Created ${componentName}`);
      } catch (error) {
        console.error(`❌ Error generating ${componentName}:`, error.message);
      }
    }
    await updateIndexFile(aiscriptDir,componentUsages);

    console.log('Done! 🎉');
  }
  
  main().catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });