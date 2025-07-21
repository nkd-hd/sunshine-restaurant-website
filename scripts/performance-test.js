#!/usr/bin/env node

/**
 * Performance Testing and Optimization Script for Sunshine Restaurant
 * Analyzes build output, bundle sizes, and provides optimization recommendations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m'
};

// Performance thresholds
const THRESHOLDS = {
  BUNDLE_SIZE_WARNING: 200 * 1024, // 200KB
  BUNDLE_SIZE_ERROR: 500 * 1024,   // 500KB
  BUILD_TIME_WARNING: 30000,       // 30 seconds
  BUILD_TIME_ERROR: 60000,         // 1 minute
  FIRST_LOAD_JS_WARNING: 150 * 1024, // 150KB
  FIRST_LOAD_JS_ERROR: 250 * 1024    // 250KB
};

class PerformanceTester {
  constructor() {
    this.results = {
      buildTime: 0,
      bundleSizes: {},
      recommendations: [],
      warnings: [],
      errors: []
    };
  }

  log(message, color = 'white') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  logHeader(message) {
    console.log(`\n${colors.bold}${colors.cyan}${'='.repeat(60)}${colors.reset}`);
    console.log(`${colors.bold}${colors.cyan}${message.toUpperCase()}${colors.reset}`);
    console.log(`${colors.bold}${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
  }

  logSuccess(message) {
    this.log(`✅ ${message}`, 'green');
  }

  logWarning(message) {
    this.log(`⚠️  ${message}`, 'yellow');
    this.results.warnings.push(message);
  }

  logError(message) {
    this.log(`❌ ${message}`, 'red');
    this.results.errors.push(message);
  }

  logRecommendation(message) {
    this.log(`💡 ${message}`, 'blue');
    this.results.recommendations.push(message);
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatTime(ms) {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }

  async runBuildAnalysis() {
    this.logHeader('Building and Analyzing Application');

    const startTime = Date.now();
    
    try {
      // Run build command
      this.log('Running production build...', 'cyan');
      execSync('npm run build', { stdio: 'pipe' });
      
      this.results.buildTime = Date.now() - startTime;
      this.logSuccess(`Build completed in ${this.formatTime(this.results.buildTime)}`);

      // Check build time
      if (this.results.buildTime > THRESHOLDS.BUILD_TIME_ERROR) {
        this.logError(`Build time (${this.formatTime(this.results.buildTime)}) exceeds error threshold`);
      } else if (this.results.buildTime > THRESHOLDS.BUILD_TIME_WARNING) {
        this.logWarning(`Build time (${this.formatTime(this.results.buildTime)}) exceeds warning threshold`);
      }

    } catch (error) {
      this.logError(`Build failed: ${error.message}`);
      throw error;
    }
  }

  async analyzeBundleSizes() {
    this.logHeader('Analyzing Bundle Sizes');

    const buildDir = path.join(process.cwd(), '.next');
    const staticDir = path.join(buildDir, 'static');

    if (!fs.existsSync(staticDir)) {
      this.logError('Build output not found. Run npm run build first.');
      return;
    }

    // Analyze JavaScript bundles
    const chunksDir = path.join(staticDir, 'chunks');
    if (fs.existsSync(chunksDir)) {
      const chunks = fs.readdirSync(chunksDir)
        .filter(file => file.endsWith('.js'))
        .map(file => {
          const filePath = path.join(chunksDir, file);
          const stats = fs.statSync(filePath);
          return {
            name: file,
            size: stats.size,
            path: filePath
          };
        })
        .sort((a, b) => b.size - a.size);

      this.log('\n📦 JavaScript Bundles:', 'bold');
      chunks.forEach(chunk => {
        const sizeStr = this.formatBytes(chunk.size);
        if (chunk.size > THRESHOLDS.BUNDLE_SIZE_ERROR) {
          this.logError(`${chunk.name}: ${sizeStr} (Too large!)`);
        } else if (chunk.size > THRESHOLDS.BUNDLE_SIZE_WARNING) {
          this.logWarning(`${chunk.name}: ${sizeStr} (Consider optimizing)`);
        } else {
          this.logSuccess(`${chunk.name}: ${sizeStr}`);
        }
      });

      this.results.bundleSizes.javascript = chunks;
    }

    // Analyze CSS files
    const cssDir = path.join(staticDir, 'css');
    if (fs.existsSync(cssDir)) {
      const cssFiles = fs.readdirSync(cssDir)
        .filter(file => file.endsWith('.css'))
        .map(file => {
          const filePath = path.join(cssDir, file);
          const stats = fs.statSync(filePath);
          return {
            name: file,
            size: stats.size,
            path: filePath
          };
        })
        .sort((a, b) => b.size - a.size);

      this.log('\n🎨 CSS Files:', 'bold');
      cssFiles.forEach(file => {
        const sizeStr = this.formatBytes(file.size);
        this.log(`${file.name}: ${sizeStr}`, 'cyan');
      });

      this.results.bundleSizes.css = cssFiles;
    }
  }

  async analyzeNextBuildOutput() {
    this.logHeader('Analyzing Next.js Build Output');

    try {
      // Parse Next.js build output for route analysis
      const buildOutput = execSync('npm run build 2>&1', { encoding: 'utf8' });
      
      // Extract route information from build output
      const routeLines = buildOutput.split('\n').filter(line => 
        line.includes('○') || line.includes('●') || line.includes('λ') || line.includes('ƒ')
      );

      if (routeLines.length > 0) {
        this.log('\n🛣️  Route Analysis:', 'bold');
        routeLines.forEach(line => {
          this.log(line.trim(), 'cyan');
        });

        // Check for large First Load JS
        const firstLoadLines = buildOutput.split('\n').filter(line => 
          line.includes('First Load JS') && line.includes('kB')
        );

        firstLoadLines.forEach(line => {
          const match = line.match(/(\d+(?:\.\d+)?)\s*kB/);
          if (match) {
            const sizeKB = parseFloat(match[1]);
            const sizeBytes = sizeKB * 1024;
            
            if (sizeBytes > THRESHOLDS.FIRST_LOAD_JS_ERROR) {
              this.logError(`First Load JS: ${sizeKB} kB (Too large!)`);
            } else if (sizeBytes > THRESHOLDS.FIRST_LOAD_JS_WARNING) {
              this.logWarning(`First Load JS: ${sizeKB} kB (Consider optimizing)`);
            }
          }
        });
      }
    } catch (error) {
      this.logWarning(`Could not analyze Next.js build output: ${error.message}`);
    }
  }

  async checkDependencies() {
    this.logHeader('Analyzing Dependencies');

    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      this.logError('package.json not found');
      return;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

    // Check for potentially large dependencies
    const largeDependencies = [
      'lodash', 'moment', 'rxjs', 'antd', 'material-ui',
      'bootstrap', 'jquery', 'chart.js', 'd3'
    ];

    const foundLargeDeps = Object.keys(dependencies).filter(dep => 
      largeDependencies.some(largeDep => dep.includes(largeDep))
    );

    if (foundLargeDeps.length > 0) {
      this.log('\n📚 Large Dependencies Found:', 'bold');
      foundLargeDeps.forEach(dep => {
        this.logWarning(`${dep}: Consider tree-shaking or alternatives`);
      });
    }

    // Check for duplicate functionality
    const uiLibraries = Object.keys(dependencies).filter(dep => 
      dep.includes('ui') || dep.includes('component') || dep.includes('design')
    );

    if (uiLibraries.length > 2) {
      this.logWarning(`Multiple UI libraries detected: ${uiLibraries.join(', ')}`);
      this.logRecommendation('Consider consolidating UI libraries to reduce bundle size');
    }
  }

  generateRecommendations() {
    this.logHeader('Performance Recommendations');

    // General recommendations
    const recommendations = [
      'Enable Next.js Image Optimization for better performance',
      'Use dynamic imports for large components',
      'Implement proper caching strategies',
      'Optimize CSS by removing unused styles',
      'Use compression for static assets',
      'Implement service workers for offline caching',
      'Consider using CDN for static assets',
      'Monitor Core Web Vitals in production',
      'Use React.memo() for expensive components',
      'Implement virtual scrolling for large lists'
    ];

    recommendations.forEach(rec => this.logRecommendation(rec));

    // Bundle-specific recommendations
    if (this.results.bundleSizes.javascript) {
      const totalJSSize = this.results.bundleSizes.javascript
        .reduce((sum, chunk) => sum + chunk.size, 0);
      
      if (totalJSSize > 1024 * 1024) { // > 1MB
        this.logRecommendation('Total JavaScript bundle size is large. Consider code splitting.');
      }
    }

    // Build time recommendations
    if (this.results.buildTime > THRESHOLDS.BUILD_TIME_WARNING) {
      this.logRecommendation('Build time is slow. Consider incremental builds or build caching.');
    }
  }

  generateReport() {
    this.logHeader('Performance Test Summary');

    this.log(`Build Time: ${this.formatTime(this.results.buildTime)}`, 'cyan');
    this.log(`Warnings: ${this.results.warnings.length}`, 'yellow');
    this.log(`Errors: ${this.results.errors.length}`, 'red');
    this.log(`Recommendations: ${this.results.recommendations.length}`, 'blue');

    // Save detailed report
    const reportPath = path.join(process.cwd(), 'performance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    this.logSuccess(`Detailed report saved to: ${reportPath}`);

    // Exit code based on results
    if (this.results.errors.length > 0) {
      process.exit(1);
    } else if (this.results.warnings.length > 0) {
      this.log('\n⚠️  Performance test completed with warnings', 'yellow');
      process.exit(0);
    } else {
      this.log('\n✅ Performance test passed!', 'green');
      process.exit(0);
    }
  }

  async runFullAnalysis() {
    try {
      await this.runBuildAnalysis();
      await this.analyzeBundleSizes();
      await this.analyzeNextBuildOutput();
      await this.checkDependencies();
      this.generateRecommendations();
      this.generateReport();
    } catch (error) {
      this.logError(`Performance analysis failed: ${error.message}`);
      process.exit(1);
    }
  }
}

// CLI usage
if (require.main === module) {
  const tester = new PerformanceTester();
  tester.runFullAnalysis();
}

module.exports = PerformanceTester;
