import fs from 'fs';
import path from 'path';

function generateCoverageBadge(coverage) {
    const { total } = coverage;
    const overall = Math.round(
        (total.statements.pct + 
         total.branches.pct + 
         total.functions.pct + 
         total.lines.pct) / 4
    );

    const color = overall >= 80 ? 'brightgreen' : 
                 overall >= 60 ? 'yellow' : 'red';

    const badge = {
        schemaVersion: 1,
        label: 'coverage',
        message: `${overall}%`,
        color
    };

    const badgePath = path.join(process.cwd(), 'coverage/badge.json');
    fs.writeFileSync(badgePath, JSON.stringify(badge, null, 2));
}

// Read coverage summary and generate badge
const coveragePath = path.join(process.cwd(), 'coverage/coverage-summary.json');
const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
generateCoverageBadge(coverage); 