import puppeteer from 'puppeteer';

import authenticate from './authentication.js';
import { OBSRecorder } from './capture/recorder.js';
import takeScreenshot, {
    getVideoDurationFromIframe,
    goToNextPage,
    hasVideoIframe,
    isLectureOver,
    waitForPageLoad,
} from './controller.js';
import { ProgressController } from './utils/progressController.js';

const recorder: OBSRecorder = new OBSRecorder();
const progressController: ProgressController = new ProgressController();

const TIMEBUFFER = 1500;

async function main() {
    try {
        // Launch Puppeteer
        const browser = await puppeteer.launch({
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900', '--window-position=0,0'],
        });

        await recorder.connect();

        let page = await browser.pages().then((pages) => pages[0]);

        // Set the page viewport size

        await authenticate(page);

        await page.goto(
            'https://www.math-intuition.de/path-player?courseid=lineare-algebra-1-intuition&unit=lineare-algebra-1-intuition_6204c653ab6bfUnit'
        );

        await new Promise((resolve) => setTimeout(resolve, 2000));

        let lectureEnded = false;
        let lectureDuration = 0;
        let currentUrl = '';
        let currentTitle = '';

        do {
            await goToNextPage(page); //Skip to next page

            await new Promise((resolve) => setTimeout(resolve, 3000));

            currentUrl = page.url();
            currentTitle = await page.title();
            lectureEnded = await isLectureOver(page);

            console.log('Current URL:', currentUrl);

            let hasVideo = false;

            try {
                hasVideo = await hasVideoIframe(page);
                console.log('Has video:', hasVideo);
            } catch (error) {
                console.log('Error:', error);
            }

            if (hasVideo) {
                lectureDuration = await getVideoDurationFromIframe(page);
                console.log(`Video duration: ${lectureDuration}`);

                if (lectureDuration !== 0) {
                    await recorder.startRecording(currentTitle);

                    console.log('Started recording for', lectureDuration + TIMEBUFFER);

                    //wait for lectureDuration + TIMEBUFFER
                    await new Promise((resolve) => setTimeout(resolve, lectureDuration + TIMEBUFFER));

                    await recorder.stopRecording();

                    console.log('Recording stopped');
                } else {
                    console.error('Video duration is not a number', lectureDuration);
                    process.exit(1);
                }
            } else {
                //take screenshot
                await takeScreenshot(page, `./output/screenshot-${progressController.getAllUrls().length}.png`);
            }

            progressController.addUrl(currentUrl);

            console.log('Added URL:', currentUrl);

            if (lectureEnded) {
                console.log('Lecture ended');
            } else {
                console.log('GoToNextPage');
            }
        } while (!lectureEnded);

        // Close the browser
        await browser.close();
        console.log('Browser closed');
    } catch (error) {
        console.error('Error:', error);
    }
}

main();
