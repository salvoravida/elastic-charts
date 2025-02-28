/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import Url from 'url';

import { DRAG_DETECTION_TIMEOUT } from '../../packages/charts/src/state/reducers/interactions';
// @ts-ignore - no type declarations
import { port, hostname, debug, isLegacyVRTServer } from '../config';
import { toMatchImageSnapshot } from '../jest_env_setup';

const legacyBaseUrl = `http://${hostname}:${port}/iframe.html`;

// @ts-ignore - used to log console statements from within the page.evaluate blocks
// page.on('console', (msg) => (msg._type === 'log' ? console.log('PAGE LOG:', msg._text) : null)); // eslint-disable-line no-console

expect.extend({ toMatchImageSnapshot });

interface MousePosition {
  /**
   * position from top of reference element, trumps bottom
   */
  top?: number;
  /**
   * position from right of reference element
   */
  right?: number;
  /**
   * position from bottom of reference element
   */
  bottom?: number;
  /**
   * position from left of reference element, trump right
   */
  left?: number;
}

interface ElementBBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface KeyboardKey {
  key: string;
  count: number;
}

type KeyboardKeys = Array<KeyboardKey>;

/**
 * Used to get position from any value of cursor position
 *
 * @param mousePosition
 * @param element
 */
function getCursorPosition(
  { top, right, bottom, left }: MousePosition,
  element: ElementBBox,
): { x: number; y: number } {
  let x = element.left;
  let y = element.top;

  if (top !== undefined || bottom !== undefined) {
    y = top !== undefined ? element.top + top : element.top + element.height - bottom!;
  }

  if (left !== undefined || right !== undefined) {
    x = left !== undefined ? element.left + left : element.left + element.width - right!;
  }

  return { x, y };
}

interface ScreenshotDOMElementOptions {
  padding?: number;
  path?: string;
  /**
   * Screenshot selector override. Used to select beyond set element.
   */
  hiddenSelectors?: string[];
  /**
   * Pauses just before taking screenshot to debug dom
   *
   * To continue:
   *  - resume script execution in dev tools
   *  - press enter in the terminal running the jest tests
   *
   * **Only triggered when `process.env.DEBUG` is true**
   */
  debug?: boolean;
}

type ScreenshotElementAtUrlOptions = ScreenshotDOMElementOptions & {
  /**
   * timeout for waiting on element to appear in DOM
   *
   * @defaultValue 10000
   */
  timeout?: number;
  /**
   * any desired action to be performed after loading url, prior to screenshot
   */
  action?: () => void | Promise<void>;
  /**
   * Selector used to wait on DOM element
   */
  waitSelector?: string;
  /**
   * Delay to take screenshot after element is visible
   */
  delay?: number;
  /**
   * Screenshot selector override. Used to select beyond set element.
   */
  screenshotSelector?: string;
};

class CommonPage {
  readonly chartWaitSelector = '.echChartStatus[data-ech-render-complete=true]';

  readonly chartSelector = '.echChart';

  /**
   * Parse url from knob storybook url to iframe storybook url
   *
   * @param url
   */
  static parseUrl(url: string): string {
    if (isLegacyVRTServer) {
      const { query } = Url.parse(url);
      return `${legacyBaseUrl}?${query}${query ? '&' : ''}knob-debug=false`;
    }
    const { query } = Url.parse(url, true);
    const { id, ...rest } = query;
    return Url.format({
      protocol: 'http',
      hostname,
      port,
      query: {
        path: `/story/${id}`,
        ...rest,
        'knob-debug': false,
      },
    });
  }

  /**
   * Toggle element visibility
   * @param selector
   */
  async toggleElementVisibility(selector: string) {
    await page.$$eval(selector, (elements) => {
      elements.forEach((element) => {
        element.classList.toggle('echInvisible');
      });
    });
  }

  /**
   * Get getBoundingClientRect of selected element
   *
   * @param selector
   */
  async getBoundingClientRect(selector: string) {
    return await page.$eval(selector, (element) => {
      const { x, y, width, height } = element.getBoundingClientRect();
      return { left: x, top: y, width, height, id: element.id };
    });
  }

  /**
   * Capture screenshot of selected element only
   *
   * @param selector
   * @param options
   */
  async screenshotDOMElement(selector: string, options?: ScreenshotDOMElementOptions): Promise<Buffer> {
    const padding: number = options && options.padding ? options.padding : 0;
    const path: string | undefined = options && options.path ? options.path : undefined;
    const rect = await this.getBoundingClientRect(selector);

    if (options?.hiddenSelectors) {
      await Promise.all(options.hiddenSelectors.map(this.toggleElementVisibility));
    }

    if (options?.debug && debug) {
      await jestPuppeteer.debug();
    }

    const buffer = await page.screenshot({
      path,
      clip: {
        x: rect.left - padding,
        y: rect.top - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      },
    });

    if (options?.hiddenSelectors) {
      await Promise.all(options.hiddenSelectors.map(this.toggleElementVisibility));
    }

    return buffer;
  }

  /**
   * Move mouse
   * @param mousePosition
   * @param selector
   */
  async moveMouse(x: number, y: number) {
    await page.mouse.move(x, y);
  }

  /**
   * Move mouse relative to element
   *
   * @param mousePosition
   * @param selector
   */
  async moveMouseRelativeToDOMElement(mousePosition: MousePosition, selector: string) {
    const element = await this.getBoundingClientRect(selector);
    const { x, y } = getCursorPosition(mousePosition, element);
    await this.moveMouse(x, y);
  }

  /**
   * Click mouse relative to element
   *
   * @param mousePosition
   * @param selector
   */
  async clickMouseRelativeToDOMElement(mousePosition: MousePosition, selector: string) {
    const element = await this.getBoundingClientRect(selector);
    const { x, y } = getCursorPosition(mousePosition, element);
    await page.mouse.click(x, y);
  }

  /**
   * Drag mouse relative to element
   *
   * @param mousePosition
   * @param selector
   */
  async dragMouseRelativeToDOMElement(start: MousePosition, end: MousePosition, selector: string) {
    const element = await this.getBoundingClientRect(selector);
    const { x: x0, y: y0 } = getCursorPosition(start, element);
    const { x: x1, y: y1 } = getCursorPosition(end, element);
    await this.moveMouse(x0, y0);
    await page.mouse.down();
    await page.waitFor(DRAG_DETECTION_TIMEOUT);
    await this.moveMouse(x1, y1);
  }

  /**
   * Drop mouse
   *
   * @param mousePosition
   * @param selector
   */
  async dropMouse() {
    await page.mouse.up();
  }

  /**
   * Press keyboard keys
   * @param count
   * @param key
   */
  // eslint-disable-next-line class-methods-use-this
  async pressKey(key: string, count: number) {
    if (key === 'tab') {
      let i = 0;
      while (i < count) {
        // eslint-disable-next-line eslint-comments/disable-enable-pair
        /* eslint-disable no-await-in-loop */
        await page.keyboard.press('Tab');
        i++;
      }
    } else if (key === 'enter') {
      let i = 0;
      while (i < count) {
        await page.keyboard.press('Enter');
        i++;
      }
    }
  }

  /**
   * Drag and drop mouse relative to element
   *
   * @param mousePosition
   * @param selector
   */
  async dragAndDropMouseRelativeToDOMElement(start: MousePosition, end: MousePosition, selector: string) {
    await this.dragMouseRelativeToDOMElement(start, end, selector);
    await this.dropMouse();
  }

  /**
   * Expect an element given a url and selector from storybook
   *
   * - Note: No need to fix host or port. They will be set automatically.
   *
   * @param url Storybook url from knobs section
   * @param selector selector of element to screenshot
   * @param options
   */
  async expectElementAtUrlToMatchScreenshot(
    url: string,
    selector: string = 'body',
    options?: ScreenshotElementAtUrlOptions,
  ) {
    try {
      const success = await this.loadElementFromURL(url, options?.waitSelector ?? selector, options?.timeout);

      expect(success).toBe(true);

      if (options?.action) {
        await options.action();
      }

      if (options?.delay) {
        await page.waitFor(options.delay);
      }

      const element = await this.screenshotDOMElement(options?.screenshotSelector ?? selector, options);

      if (!element) {
        // eslint-disable-next-line no-console
        console.error(`Failed to find element at \`${selector}\`\n\n\t${url}`);
      }

      expect(element).toBeDefined();
      expect(element).toMatchImageSnapshot();
    } catch {
      // prevent throwing error on failed assertion
    }
  }

  /**
   * Expect a chart given a url from storybook
   *
   * @param url Storybook url from knobs section
   * @param options
   */
  async expectChartAtUrlToMatchScreenshot(url: string, options?: ScreenshotElementAtUrlOptions) {
    await this.expectElementAtUrlToMatchScreenshot(url, this.chartSelector, {
      waitSelector: this.chartWaitSelector,
      ...options,
    });
  }

  /**
   * Expect a chart given a url from storybook with mouse move
   *
   * @param url Storybook url from knobs section
   * @param mousePosition - position of mouse relative to chart
   * @param options
   */
  async expectChartWithMouseAtUrlToMatchScreenshot(
    url: string,
    mousePosition: MousePosition,
    options?: ScreenshotElementAtUrlOptions,
  ) {
    const action = async () => {
      await options?.action?.();
      await this.moveMouseRelativeToDOMElement(mousePosition, this.chartSelector);
    };
    await this.expectChartAtUrlToMatchScreenshot(url, {
      ...options,
      action,
    });
  }

  /**
   * Expect a chart given a url from storybook with keyboard events
   * @param url
   * @param keyboardEvents
   * @param options
   */
  async expectChartWithKeyboardEventsAtUrlToMatchScreenshot(
    url: string,
    keyboardEvents: KeyboardKeys,
    options?: Omit<ScreenshotElementAtUrlOptions, 'action'>,
  ) {
    const action = async () => {
      // click to focus within the chart
      await this.clickMouseRelativeToDOMElement({ top: 0, left: 0 }, this.chartSelector);
      // eslint-disable-next-line no-restricted-syntax
      for (const actions of keyboardEvents) {
        await this.pressKey(actions.key, actions.count);
      }
      await this.moveMouseRelativeToDOMElement({ top: 0, left: 0 }, this.chartSelector);
    };

    await this.expectChartAtUrlToMatchScreenshot(url, {
      ...options,
      action,
    });
  }

  /**
   * Expect a chart given a url from storybook with mouse move
   *
   * @param url Storybook url from knobs section
   * @param start - the start position of mouse relative to chart
   * @param end - the end position of mouse relative to chart
   * @param options
   */
  async expectChartWithDragAtUrlToMatchScreenshot(
    url: string,
    start: MousePosition,
    end: MousePosition,
    options?: Omit<ScreenshotElementAtUrlOptions, 'action'>,
  ) {
    const action = async () => await this.dragMouseRelativeToDOMElement(start, end, this.chartSelector);
    await this.expectChartAtUrlToMatchScreenshot(url, {
      ...options,
      action,
    });
  }

  /**
   * Loads storybook page from raw url, and waits for element
   *
   * @param url Storybook url from knobs section
   * @param waitSelector selector of element to wait to appear in DOM
   * @param timeout timeout for waiting on element to appear in DOM
   */
  async loadElementFromURL(url: string, waitSelector?: string, timeout?: number): Promise<boolean> {
    const cleanUrl = CommonPage.parseUrl(url);
    await page.goto(cleanUrl);

    if (waitSelector) {
      try {
        await this.waitForElement(waitSelector, timeout);
        return true;
      } catch {
        // eslint-disable-next-line no-console
        console.error(`Failed to load url. Check story at: \n\n\tstorybook url: ${url}\n\tlocal vrt url: ${cleanUrl}`);
        return false;
      }
    }

    if (isLegacyVRTServer) {
      // activate peripheral visibility
      await page.evaluate(() => {
        document.querySelector('html')!.classList.add('echVisualTesting');
      });
      return true;
    }

    return false;
  }

  /**
   * Wait for an element to be on the DOM
   *
   * @param {string} [waitSelector] the DOM selector to wait for, default to '.echChartStatus[data-ech-render-complete=true]'
   * @param {number} [timeout] - the timeout for the operation, default to 10000ms
   */
  async waitForElement(waitSelector: string, timeout = 10000) {
    await page.waitForSelector(waitSelector, { timeout });
  }
}

export const common = new CommonPage();
