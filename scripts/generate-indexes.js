import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const BASE_PATH = '../src/content/docs'

function toTitleCase(str) {
    return str
      .toLowerCase()
      .split('-')
      .join(' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

function pathToURL(str) {
    const basePath = path.join(__dirname, BASE_PATH)

    return str.replace(basePath, '/docs/en')
}

function generateList(files, dir) {
    return files
        .filter(file => {
            const ext = path.extname(file);
            const name = path.basename(file, ext);
            return name !== 'index'
        })
        .map((file) => {
            const filePath = path.join(dir, file);
            if (fs.statSync(filePath).isDirectory()) {
            return `- [${toTitleCase(file)}](${pathToURL(path.join(dir, file))})`;
            } else {
            const ext = path.extname(file);
            if (ext === '.md' || ext === '.mdx') {
                const name = path.basename(file, ext);
                return `- [${toTitleCase(name)}](${pathToURL(path.join(dir, name))})`;
            }
            }
        })
        .filter((item) => item !== undefined)
        .join('\n');
}

function createContent (files, dir) {
    const list = generateList(files, dir)

    return `---
title: ${toTitleCase(path.basename(dir))}
layout: '@layouts/DocsPageLayout.astro'
autogenerated: true
---

Pages in this section:

${list}
`
}

function createIndexFiles(dir) {
  // Get a list of all files and directories in the current directory
  const files = fs.readdirSync(dir);

  // Check if the current directory already has an index file
  const hasIndex = files.some((file) => file === 'index.md' || file === 'index.mdx');

  // Check if any autogenerated index files already exist
  const autogeneratedIndexes = files.filter((file) => {
    const filePath = path.join(dir, file);
    const isDir = fs.statSync(filePath).isDirectory()
    if (isDir) return false;

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const frontmatter = fileContent.match(/^---\n([\s\S]*?)\n---/);
    return frontmatter && frontmatter[1].includes('autogenerated: true');
  });

  // Regenerate autogenerated index files
  if (autogeneratedIndexes.length > 0) {
    autogeneratedIndexes.forEach((file) => {
      const filePath = path.join(dir, file);
      const content = createContent(files, dir);
      console.log(`Regenerating ${filePath}`)
      fs.writeFileSync(filePath, content);
    });
  }

  // If it doesn't, create one
  if (!hasIndex) {
    const content = createContent(files, dir);

    console.log(`Creating ${dir}/index.md`)
    fs.writeFileSync(path.join(dir, 'index.md'), content);
  }

  // Recursively call this function for each subdirectory
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      createIndexFiles(filePath);
    }
  });
}

// Call the function starting from the root directory
createIndexFiles(path.join(__dirname, BASE_PATH));