import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(__dirname));

// Endpoint to save config
app.post('/api/save-config', async (req, res) => {
    try {
        const { file, data } = req.body;

        // Validate file path to prevent directory traversal
        if (!file || !/^[a-zA-Z0-9]+Config$/.test(file)) {
            return res.status(400).json({ error: 'Invalid config file name' });
        }

        const configPath = path.join(__dirname, 'js', 'config', `${file}.js`);

        // Read existing file
        let content = await fs.readFile(configPath, 'utf8');

        // Strategy: Replace the object or array export content
        // We use a regex that captures from "export const Name = " to the last semicolon
        // Strategy: Find the start of the export and replace until the end
        // We assume the export is the last significant part of the file
        const startMarker = `export const ${file} = `;
        const startIndex = content.indexOf(startMarker);

        // Convert data object to string with indentation
        const newContent = JSON.stringify(data, null, 4);

        if (startIndex !== -1) {
            console.log(`Found export for ${file}`);

            // Keep everything before the export
            const prefix = content.substring(0, startIndex);

            // Reconstruct file
            content = `${prefix}${startMarker}${newContent};\n`;

            // Write back to file
            await fs.writeFile(configPath, content, 'utf8');
            console.log(`Updated ${file}.js`);
            res.json({ success: true, message: `Saved ${file}.js` });
        } else {
            console.error(`Could not match structure in ${file}.js`);
            console.log('Marker not found:', startMarker);
            // Log first part of file to see what we're matching against
            console.log('File start:', content.substring(0, 200));
            res.status(500).json({ success: false, error: 'Could not parse existing config file structure' });
        }
    } catch (error) {
        console.error('Save error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Level Management Endpoints

// List all levels
app.get('/api/levels', async (req, res) => {
    try {
        const levelsDir = path.join(__dirname, 'levels');
        // Ensure directory exists
        try {
            await fs.access(levelsDir);
        } catch {
            await fs.mkdir(levelsDir);
        }

        const files = await fs.readdir(levelsDir);
        const levels = files
            .filter(file => file.endsWith('.json'))
            .map(file => file.replace('.json', ''));

        res.json(levels);
    } catch (error) {
        console.error('List levels error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get specific level
app.get('/api/levels/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const levelPath = path.join(__dirname, 'levels', `${name}.json`);

        const content = await fs.readFile(levelPath, 'utf8');
        res.json(JSON.parse(content));
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.status(404).json({ error: 'Level not found' });
        } else {
            console.error('Get level error:', error);
            res.status(500).json({ error: error.message });
        }
    }
});

// Save level
app.post('/api/levels', async (req, res) => {
    try {
        const { name, data } = req.body;
        if (!name || !data) {
            return res.status(400).json({ error: 'Name and data are required' });
        }

        // Sanitize name
        const safeName = name.replace(/[^a-zA-Z0-9\-_ ]/g, '').trim();
        if (!safeName) {
            return res.status(400).json({ error: 'Invalid level name' });
        }

        const levelsDir = path.join(__dirname, 'levels');
        try {
            await fs.access(levelsDir);
        } catch {
            await fs.mkdir(levelsDir);
        }

        const levelPath = path.join(levelsDir, `${safeName}.json`);
        await fs.writeFile(levelPath, JSON.stringify(data, null, 4), 'utf8');

        console.log(`Saved level: ${safeName}`);
        res.json({ success: true, message: `Saved level ${safeName}` });
    } catch (error) {
        console.error('Save level error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete level
app.delete('/api/levels/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const levelPath = path.join(__dirname, 'levels', `${name}.json`);

        await fs.unlink(levelPath);
        console.log(`Deleted level: ${name}`);
        res.json({ success: true, message: `Deleted level ${name}` });
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.status(404).json({ error: 'Level not found' });
        } else {
            console.error('Delete level error:', error);
            res.status(500).json({ error: error.message });
        }
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('Lab Mode Active');
});
