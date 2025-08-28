const { execSync } = require('child_process');

// Initialize shadcn with the required settings
const initShadcn = () => {
  try {
    console.log('Initializing shadcn...');
    
    // Create a new shadcn config file with our preferred settings
    const config = {
      $schema: "https://ui.shadcn.com/schema.json",
      style: "new-york",
      tailwind: {
        config: "tailwind.config.js",
        css: "src/app/globals.css",
        baseColor: "neutral",
        cssVariables: true
      },
      "framework": "next",
      components: "./components",
      utils: "./lib/utils"
    };
    
    require('fs').writeFileSync('components.json', JSON.stringify(config, null, 2));
    
    // Install required dependencies
    execSync('npx shadcn@latest add button card form input label', { stdio: 'inherit' });
    
    console.log('shadcn initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing shadcn:', error);
    process.exit(1);
  }
};

initShadcn();
