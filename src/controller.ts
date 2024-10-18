import { Page } from 'puppeteer';
import { timeStringToMilliseconds } from './utils/time.js';

/**
 * Take a full-page screenshot of the current page
 * @param page
 * @param screenshotPath
 * @returns
 */
export default function takeScreenshot(page: Page, screenshotPath: string): Promise<Buffer> {
    console.log(`Screenshot saved at ${screenshotPath}`);
    return page.screenshot({ path: screenshotPath, fullPage: true });
}

/**
 * Get the current URL of the page
 * @param page
 * @returns
 */
export async function getCurrentUrl(page: Page): Promise<string> {
    return page.url();
}

/**
 * Check if the page has an iframe with a video element
 * @param page
 * @returns
 */
export async function hasVideoIframe(page: Page): Promise<boolean> {
    const iframeElement = await page.$('iframe#playerFrame');
    if (!iframeElement) {
        return false;
    }

    // Get the iframe content
    const iframe = await iframeElement.contentFrame();
    if (!iframe) {
        throw new Error('Unable to access iframe content');
    }

    // Wait for the video duration element or retrieve the video duration through the player inside the iframe
    const videoElement = await iframe
        .waitForSelector('div.time.learnworlds-main-text-tiny.no-margin-bottom.weglot-exclude', { timeout: 1000 })
        .catch(() => null);

    return videoElement !== null;
}

/**
 * Get the video duration in milliseconds from the iframe
 * @param page
 * @returns The video duration in milliseconds
 */
export async function getVideoDurationFromIframe(page: Page): Promise<number> {
    const iframeElement = await page.$('iframe#playerFrame');
    if (!iframeElement) {
        throw new Error('Iframe element not found');
    }

    // Get the iframe content
    const iframe = await iframeElement.contentFrame();
    if (!iframe) {
        throw new Error('Unable to access iframe content');
    }

    // Wait for the video duration element or retrieve the video duration through the player inside the iframe
    const videoElement = await iframe.waitForSelector(
        'div.time.learnworlds-main-text-tiny.no-margin-bottom.weglot-exclude'
    );
    const videoDurationText = await videoElement?.evaluate((element) => element.textContent?.trim());

    if (typeof videoDurationText !== 'string') {
        throw new Error('Video duration not found');
    }

    // Extract the total duration part (after the "/")
    const durationPart = videoDurationText.split('/')[1]?.trim();
    if (!durationPart) {
        throw new Error('Could not parse video duration');
    }

    return timeStringToMilliseconds(durationPart);
}

/**
 * Get the current video time in milliseconds
 * @param page
 */
export async function goToNextPage(page: Page): Promise<void> {
    // Wait for the elements to appear in the DOM
    await page.waitForSelector('.default-course-player-nav-btn-lbl.no-margin-bottom.learnworlds-main-text-small');

    // Select all elements with the target classes
    const elements = await page.$$('.default-course-player-nav-btn-lbl.no-margin-bottom.learnworlds-main-text-small');

    // Click the second element (index 1 because indices are 0-based)
    if (elements.length > 1) {
        await elements[1].click();
    } else {
        console.log('There are fewer than 2 elements with the specified classes.');
    }
}

/**
 * Check if the lecture is over
 * @param page
 * @returns
 */
export async function isLectureOver(page: Page): Promise<boolean> {
    const element = await page.$('text="Das ist die letzte Lerneinheit!"');
    return element !== null;
}

/**
 * Wait for the page to load
 * @param page
 */
export async function waitForPageLoad(page: Page): Promise<void> {
    await page.waitForNavigation();
}
