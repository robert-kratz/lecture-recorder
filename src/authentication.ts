import { Browser, Locator, Page } from 'puppeteer';

/**
 * Authenticate with the website
 * @param browser
 * @param page
 * @returns
 */
export default async function authenticate(page: Page): Promise<Page> {
    try {
        const timeout = 5000;
        page.setDefaultTimeout(timeout);

        {
            const targetPage = page;
            await targetPage.setViewport({
                width: 1440,
                height: 900,
            });
        }
        {
            const targetPage = page;
            const promises: Promise<any>[] = [];
            const startWaitingForEvents = () => {
                promises.push(targetPage.waitForNavigation());
            };
            startWaitingForEvents();
            await targetPage.goto('https://www.math-intuition.de/');
            await Promise.all(promises);
        }
        {
            const targetPage = page;
            await Locator.race([
                targetPage.locator('::-p-aria(Einloggen) >>>> ::-p-aria([role=\\"generic\\"])'),
                targetPage.locator('#el_1593094758407_18 li:nth-of-type(1) span'),
                targetPage.locator('::-p-xpath(//*[@id=\\"menuItem5\\"]/span)'),
                targetPage.locator(':scope >>> #el_1593094758407_18 li:nth-of-type(1) span'),
            ])
                .setTimeout(timeout)
                .click({
                    offset: {
                        x: 52.25,
                        y: 14.59375,
                    },
                });
        }
        {
            const targetPage = page;
            await Locator.race([
                targetPage.locator('#animatedModal > div'),
                targetPage.locator('::-p-xpath(//*[@id=\\"animatedModal\\"]/div)'),
                targetPage.locator(':scope >>> #animatedModal > div'),
            ])
                .setTimeout(timeout)
                .click({
                    delay: 616.1000000000931,
                    offset: {
                        x: 357,
                        y: 331,
                    },
                });
        }
        {
            const targetPage = page;
            await Locator.race([
                targetPage.locator('::-p-aria(E-Mail)'),
                targetPage.locator('div.mb-10 > input'),
                targetPage.locator(
                    '::-p-xpath(//*[@id=\\"animatedModal\\"]/div/div/div[2]/div[3]/form/div[2]/div[1]/input)'
                ),
                targetPage.locator(':scope >>> div.mb-10 > input'),
            ])
                .setTimeout(timeout)
                .fill(process.env.USERNAME || '');
        }
        {
            const targetPage = page;
            await Locator.race([
                targetPage.locator('#animatedModal > div'),
                targetPage.locator('::-p-xpath(//*[@id=\\"animatedModal\\"]/div)'),
                targetPage.locator(':scope >>> #animatedModal > div'),
            ])
                .setTimeout(timeout)
                .click({
                    delay: 476.80000000004657,
                    offset: {
                        x: 353,
                        y: 402,
                    },
                });
        }
        {
            const targetPage = page;
            await Locator.race([
                targetPage.locator('::-p-aria(Passwort)'),
                targetPage.locator('div.mb-20 > input'),
                targetPage.locator(
                    '::-p-xpath(//*[@id=\\"animatedModal\\"]/div/div/div[2]/div[3]/form/div[2]/div[2]/input)'
                ),
                targetPage.locator(':scope >>> div.mb-20 > input'),
            ])
                .setTimeout(timeout)
                .fill(process.env.PASSWORD || '');
        }
        {
            const targetPage = page;
            const promises: Promise<any>[] = [];
            const startWaitingForEvents = () => {
                promises.push(targetPage.waitForNavigation());
            };
            await Locator.race([
                targetPage.locator('#submitLogin'),
                targetPage.locator('::-p-xpath(//*[@id=\\"submitLogin\\"])'),
                targetPage.locator(':scope >>> #submitLogin'),
            ])
                .setTimeout(timeout)
                .on('action', () => startWaitingForEvents())
                .click({
                    offset: {
                        x: 312.5,
                        y: 22.3828125,
                    },
                });
            await Promise.all(promises);

            return page;
        }
    } catch (error) {
        console.error('Error during authentication:', error);
        process.exit(1);
    }
}
