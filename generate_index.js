const fs = require('fs');
const path = require('path');

const targetDirectory = 'C:\\Users\\DELL\\Desktop\\glohsen-olawumi\\public\\skeleton_models';

function getFilesRecursively(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getFilesRecursively(filePath));
        } else if (file.endsWith('.stl')) {
            // Store relative path for the web index
            const relativePath = path.relative(targetDirectory, filePath).replace(/\\/g, '/');
            results.push({
                name: file.replace('.stl', ''),
                path: `./${relativePath}`,
                size: (stat.size / 1024).toFixed(2) + ' KB'
            });
        }
    });
    return results;
}

try {
    const files = getFilesRecursively(targetDirectory);

    // 1. Generate a JSON manifest
    fs.writeFileSync(
        path.join(targetDirectory, 'index.json'),
        JSON.stringify(files, null, 2)
    );
    console.log(`Generated index.json with ${files.length} items`);

    // 2. Generate a simple HTML index to easily view them in the browser
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Skeleton 3D Models Index</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 20px; background-color: #f5f5f5; color: #333; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { margin-top: 0; padding-bottom: 10px; border-bottom: 1px solid #eee; }
        .file-list { display: grid; gap: 10px; }
        .file-item { display: flex; justify-content: space-between; padding: 10px; border: 1px solid #eee; border-radius: 4px; }
        .file-item:hover { background-color: #f9f9f9; }
        a { color: #0066cc; text-decoration: none; font-weight: 500; }
        a:hover { text-decoration: underline; }
        .meta { color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Bones Index - .STL Files</h1>
        <p>Total Models: ${files.length}</p>
        <div class="file-list">
            ${files.map(f => `
            <div class="file-item">
                <a href="${f.path}" target="_blank">${f.path}</a>
                <span class="meta">${f.size}</span>
            </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;

    fs.writeFileSync(path.join(targetDirectory, 'index.html'), htmlContent);
    console.log(`Generated index.html`);
} catch (e) {
    console.error("Error generating index:", e);
}
