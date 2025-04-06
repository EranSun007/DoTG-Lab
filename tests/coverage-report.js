import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

async function generateCoverageReport() {
    try {
        // Run tests with coverage
        console.log('Running tests with coverage...');
        await execAsync('npm run test:coverage');

        // Read coverage summary
        const coveragePath = path.join(process.cwd(), 'coverage/coverage-summary.json');
        const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));

        // Generate report
        console.log('\nCoverage Report:');
        console.log('================');
        
        Object.entries(coverage.total).forEach(([metric, data]) => {
            console.log(`${metric}: ${data.pct}% (${data.covered}/${data.total})`);
        });

        // Check if coverage meets thresholds
        const thresholds = {
            statements: 80,
            branches: 80,
            functions: 80,
            lines: 80
        };

        let meetsThresholds = true;
        Object.entries(thresholds).forEach(([metric, threshold]) => {
            const coverage = coverage.total[metric].pct;
            if (coverage < threshold) {
                console.error(`\n❌ ${metric} coverage (${coverage}%) is below threshold (${threshold}%)`);
                meetsThresholds = false;
            }
        });

        if (meetsThresholds) {
            console.log('\n✅ All coverage thresholds met!');
        } else {
            console.log('\n❌ Some coverage thresholds not met. Please improve test coverage.');
            process.exit(1);
        }

    } catch (error) {
        console.error('Error generating coverage report:', error);
        process.exit(1);
    }
}

generateCoverageReport(); 