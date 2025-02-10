#!/usr/bin/env node

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
  const files = await glob('./**/*.{ts,tsx,js,jsx,vue}',{ignore:['./node_modules/**','./aiscript/**']});
  const componentUsages = new Map();

  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');
    const matches = content.match(/AIC\.[a-zA-Z0-9]*/g);
    
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


function detectFramework(sourceContent, fileExt) {
    const isVue = fileExt === '.vue';
    const isTypeScript = sourceContent.includes('typescript') || fileExt.includes('ts');
    return {
        isVue,
        isTypeScript,
        framework: isVue ? 'Vue' : 'React',
        fileExtension: isVue ? '.vue' : (isTypeScript ? '.tsx' : '.jsx')
    };
}

async function generateComponent(componentName, sourceFile) {
    const sourceContent = await fs.readFile(sourceFile, 'utf-8');
    const fileExt = path.extname(sourceFile);
    const { isVue, isTypeScript, framework, fileExtension } = detectFramework(sourceContent, fileExt);

    const message = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 4000,
      messages: [{
        role: "user",
        content: `You are helping create a ${framework} component named ${componentName}. Here is the context where it's being used:
  
  ${sourceContent}
  
  Please create a ${isTypeScript ? 'TypeScript' : 'JavaScript'} ${framework} component that would work well in this context. The component should:
  1. Be exported as default
  2. ${isTypeScript ? 'Include proper TypeScript types' : 'Use JSDoc for type documentation'}
  4. Be fully functional based on how it appears to be used in the source file - Must align perfectly with  comments in the usage file
  5. The file must be COMPLETELY self contained apart from third party imports, so no .css imports, and no imports of helper functions or components at all.
  6. ${isVue ? 'Include both template and script sections' : ''}
  7. ONLY have one default export, the component
  
  Return only the component code with no explanation or markdown.`
      }]
    });
  
    const componentCode = message.content[0].text;
    return componentCode;
  }
  
  async function updateIndexFile(aiscriptDir, componentUsages) {
    const componentFiles = await glob(path.join(aiscriptDir, '*.{tsx,jsx,vue}'));

    const validComponents = new Set(componentUsages.keys());

    // Delete components that are no longer referenced
    for (const file of componentFiles) {
        const ext = path.extname(file);
        const componentName = path.basename(file, ext);
        if (!validComponents.has(componentName)) {
        console.log(`🗑️ Deleting unused component: ${componentName}`);
        await fs.remove(file);
        }
    }
    const exports = await Promise.all([...validComponents].map(async componentName => {
      const sourceFile = componentUsages.get(componentName);
      const sourceContent = await fs.readFile(sourceFile, 'utf-8');
      const sourceExt = path.extname(sourceFile);
      const { fileExtension } = detectFramework(sourceContent, sourceExt);
      return `import ${componentName} from './${componentName}${fileExtension}';`;
    }));
    
    const exportMap = `export const AIC = {
${[...validComponents].map(componentName => {
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

    // Create aiscript directory in the most appropriate location
    const projectRoot = process.cwd();
    const commonDirs = ['src', 'app', 'source'];
    let aiscriptDir;
    
    // Try to find an existing source directory
    for (const dir of commonDirs) {
      if (await fs.pathExists(path.join(projectRoot, dir))) {
        aiscriptDir = path.join(projectRoot, dir, 'aiscript');
        break;
      }
    }
    
    // Fall back to project root if no common source directory found
    if (!aiscriptDir) {
      aiscriptDir = path.join(projectRoot, 'aiscript');
    }
    
    await fs.ensureDir(aiscriptDir);
  
    const componentUsages = await findComponentUsages();
    
    if (componentUsages.size === 0) {
      console.log('No AIC component usages found.');
      return;
    }
  
    console.log(`Found ${componentUsages.size} component(s) to process...`);
  
    for (const [componentName, sourceFile] of componentUsages) {
      const sourceExt = path.extname(sourceFile);
      const sourceContent = await fs.readFile(sourceFile, 'utf-8');
      const { fileExtension } = detectFramework(sourceContent, sourceExt);
      const componentPath = path.join(aiscriptDir, `${componentName}${fileExtension}`);
      
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