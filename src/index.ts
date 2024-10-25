import axios from 'axios';
import inquirer from 'inquirer';
import ora from 'ora';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

let finalFileName = process.argv[2] || `output-${Date.now()}`;

// Ask for inputs: auth token and video URL
async function getUserInputs() {
    const { authToken, videoUrl } = await inquirer.prompt([
        {
            type: 'input',
            name: 'authToken',
            message: 'Please enter your authentication token (in the lw_tokens format):',
        },
        {
            type: 'input',
            name: 'videoUrl',
            message: 'Please enter the Wistia video URL:',
        },
    ]);
    return { authToken, videoUrl };
}

// Function to download video snippets
async function downloadSnippet(
    url: string,
    authToken: string,
    segmentNumber: number,
    tempDir: string
): Promise<string | null> {
    const spinner = ora(`Downloading segment seg-${segmentNumber}-v1-a1.ts...`).start();
    const segmentUrl = url.replace(/seg-\d+-v1-a1\.ts/, `seg-${segmentNumber}-v1-a1.ts`);
    const outputFile = path.join(tempDir, `seg-${segmentNumber}.ts`);

    try {
        const response = await axios.get(segmentUrl, {
            responseType: 'stream',
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        });

        const writer = fs.createWriteStream(outputFile);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                spinner.succeed(`Downloaded segment seg-${segmentNumber}-v1-a1.ts (${outputFile})`);
                resolve(outputFile);
            });
            writer.on('error', reject);
        });
    } catch (error: any) {
        spinner.fail(`Error downloading segment seg-${segmentNumber}-v1-a1.ts`);
        if (error.response && (error.response.status === 401 || error.response.status === 404)) {
            return null;
        }
        throw error;
    }
}

// Merge all snippets into an MP4 using ffmpeg
function mergeSnippets(tempDir: string, outputFilePath: string) {
    return new Promise((resolve, reject) => {
        const inputFileList = path.join(tempDir, 'input.txt');
        const files = fs
            .readdirSync(tempDir)
            .filter((file) => file.endsWith('.ts'))
            .sort((a, b) => {
                // Extract the segment numbers and sort them numerically
                const numA = parseInt(a.match(/seg-(\d+)/)?.[1] || '0', 10);
                const numB = parseInt(b.match(/seg-(\d+)/)?.[1] || '0', 10);
                return numA - numB;
            })
            .map((file) => `file '${path.join(tempDir, file)}'`)
            .join('\n');

        fs.writeFileSync(inputFileList, files);

        const command = `ffmpeg -f concat -safe 0 -i ${inputFileList} -c copy ${outputFilePath}`;
        exec(command, (error) => {
            if (error) {
                reject(error);
            } else {
                resolve(outputFilePath);
            }
        });
    });
}

async function main() {
    try {
        const { authToken, videoUrl } = await getUserInputs();

        const videoId = videoUrl.match(/deliveries\/([^\/]+)\.m3u8/);
        if (!videoId) {
            console.error('Invalid URL format. Could not extract video ID.');
            return;
        }

        const tempDir = fs.mkdtempSync(path.join(process.cwd(), 'temp-'));
        let segmentNumber = 1;
        const downloadedFiles: string[] = [];

        // Download segments sequentially
        while (true) {
            const filePath = await downloadSnippet(videoUrl, authToken, segmentNumber, tempDir);
            if (!filePath) break;
            downloadedFiles.push(filePath);
            segmentNumber++;
        }

        if (downloadedFiles.length === 0) {
            console.log('No segments were downloaded.');
            return;
        }

        const outputFilePath = path.join(`${process.cwd()}/output`, `${finalFileName}.mp4`);
        console.log('Merging video segments...');
        await mergeSnippets(tempDir, outputFilePath);

        console.log(`Merged video saved to: ${outputFilePath}`);

        console.log('Removing downloaded video segments...');
        // Clean up temp files
        fs.rm(tempDir, { recursive: true }, (error) => {
            if (error) {
                console.error('Error cleaning up temp files:', error);
            }
        });

        ora('All done!').succeed();

        process.exit(0);
    } catch (error: any) {
        console.error('An error occurred:', error.message);
    }
}

main();
