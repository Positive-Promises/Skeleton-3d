global.LZMA = require('./lzma.js');
global.CTM = require('./ctm.js');
const fs = require('fs');
const path = require('path');

function writeSTL(ctmFile, outPath) {
    const indices = ctmFile.body.indices;
    const vertices = ctmFile.body.vertices;

    const triangleCount = indices.length / 3;
    const bufferSize = 80 + 4 + (triangleCount * 50);
    const buffer = new ArrayBuffer(bufferSize);
    const view = new DataView(buffer);

    let offset = 80;
    view.setUint32(offset, triangleCount, true);
    offset += 4;

    for (let i = 0; i < indices.length; i += 3) {
        let i0 = indices[i];
        let i1 = indices[i + 1];
        let i2 = indices[i + 2];

        let v0x = vertices[i0 * 3], v0y = vertices[i0 * 3 + 1], v0z = vertices[i0 * 3 + 2];
        let v1x = vertices[i1 * 3], v1y = vertices[i1 * 3 + 1], v1z = vertices[i1 * 3 + 2];
        let v2x = vertices[i2 * 3], v2y = vertices[i2 * 3 + 1], v2z = vertices[i2 * 3 + 2];

        let dx1 = v1x - v0x; let dy1 = v1y - v0y; let dz1 = v1z - v0z;
        let dx2 = v2x - v0x; let dy2 = v2y - v0y; let dz2 = v2z - v0z;
        let nx = dy1 * dz2 - dz1 * dy2;
        let ny = dz1 * dx2 - dx1 * dz2;
        let nz = dx1 * dy2 - dy1 * dx2;
        let len = Math.sqrt(nx * nx + ny * ny + nz * nz);
        if (len > 0) { nx /= len; ny /= len; nz /= len; }

        view.setFloat32(offset, nx, true); offset += 4;
        view.setFloat32(offset, ny, true); offset += 4;
        view.setFloat32(offset, nz, true); offset += 4;

        view.setFloat32(offset, v0x, true); offset += 4;
        view.setFloat32(offset, v0y, true); offset += 4;
        view.setFloat32(offset, v0z, true); offset += 4;

        view.setFloat32(offset, v1x, true); offset += 4;
        view.setFloat32(offset, v1y, true); offset += 4;
        view.setFloat32(offset, v1z, true); offset += 4;

        view.setFloat32(offset, v2x, true); offset += 4;
        view.setFloat32(offset, v2y, true); offset += 4;
        view.setFloat32(offset, v2z, true); offset += 4;

        view.setUint16(offset, 0, true); offset += 2;
    }

    fs.writeFileSync(outPath, Buffer.from(buffer));
    console.log(`Converted: ${path.basename(outPath)}`);
}

function convertDirectory(srcDir, destDir) {
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }

    const entries = fs.readdirSync(srcDir, { withFileTypes: true });

    for (let entry of entries) {
        const srcPath = path.join(srcDir, entry.name);
        const destPath = path.join(destDir, entry.name);

        if (entry.isDirectory()) {
            convertDirectory(srcPath, destPath);
        } else if (entry.isFile() && entry.name.endsWith('.ctm')) {
            const outPath = destPath.replace('.ctm', '.stl');
            try {
                const fileData = fs.readFileSync(srcPath);
                const stream = new CTM.Stream(new Uint8Array(fileData));
                const ctmFile = new CTM.File(stream);
                writeSTL(ctmFile, outPath);
            } catch (err) {
                console.error(`Error converting ${srcPath}:`, err.message);
            }
        }
    }
}

const sourceDirectory = path.join(__dirname, 'ctm');
const targetDirectory = 'C:\\Users\\DELL\\Desktop\\glohsen-olawumi\\public\\skeleton_models';

console.log('Starting conversion to ' + targetDirectory);
convertDirectory(sourceDirectory, targetDirectory);
console.log('Finished converting all bones to .STL!');
