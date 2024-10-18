import * as fs from 'fs';
import * as path from 'path';

export class ProgressController {
    private filePath: string;

    constructor(fileName: string = 'progress.txt') {
        // Define the file path, assuming it's in the same directory
        this.filePath = path.join('./', fileName);

        // Ensure the file exists
        if (!fs.existsSync(this.filePath)) {
            fs.writeFileSync(this.filePath, ''); // Create the file if it doesn't exist
        }
    }

    // Add a new URL to the file (as a new line)
    addUrl(url: string): void {
        fs.appendFileSync(this.filePath, `${url}\n`);
    }

    // Get all URLs as an array
    getAllUrls(): string[] {
        const fileContent = fs.readFileSync(this.filePath, 'utf-8');
        return fileContent.split('\n').filter((line) => line.trim() !== '');
    }

    // Get the last URL (last line in the file)
    getLastUrl(): string | null {
        const allUrls = this.getAllUrls();
        return allUrls.length > 0 ? allUrls[allUrls.length - 1] : null;
    }

    // Add a new list of URLs (replacing the current content)
    addNewList(urls: string[]): void {
        const newContent = urls.join('\n') + '\n';
        fs.writeFileSync(this.filePath, newContent);
    }

    // Reset the stack (clear the file)
    resetStack(): void {
        fs.writeFileSync(this.filePath, '');
    }
}
