'use server';
/**
 * @fileOverview A server-side utility for writing files to the project directory.
 * THIS IS A PLACEHOLDER. In a real-world scenario, this would be a secure
 * service that validates paths and content before writing to the filesystem.
 * For this prototype, it directly uses Node.js `fs` module, which is NOT
 * recommended for production without heavy security sandboxing.
 */

import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Writes content to a specified file within the project's `src` directory.
 * @param relativePath The path relative to the `src` directory (e.g., 'components/my-component.tsx').
 * @param content The content to write to the file.
 */
export async function writeFile(relativePath: string, content: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Prevent directory traversal attacks
    if (relativePath.includes('..')) {
      throw new Error('Invalid path specified.');
    }

    const fullPath = path.join(process.cwd(), 'src', relativePath);
    
    // Ensure the directory exists
    const dir = path.dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });

    // Write the file
    await fs.writeFile(fullPath, content, 'utf8');
    
    console.log(`Successfully wrote file to: ${fullPath}`);
    return { success: true };
  } catch (error: any) {
    console.error(`Failed to write file to ${relativePath}:`, error);
    return { success: false, error: error.message };
  }
}
