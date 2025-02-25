/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { DisplayValueStyle, HorizontalAlignment, VerticalAlignment } from '../../packages/charts/src';
import { eachRotation } from '../helpers';
import { common } from '../page_objects';

describe('Bar series stories', () => {
  describe('[test] axis positions with histogram bar series', () => {
    eachRotation.it(async (rotation) => {
      await common.expectChartAtUrlToMatchScreenshot(
        `http://localhost:9001/?path=/story/interactions--brush-selection-tool-on-histogram-time-charts&knob-debug=&knob-chartRotation=${rotation}`,
      );
    }, 'Should render correct axis - rotation %s');
  });

  describe('[test] switch ordinal/linear x axis', () => {
    it('using ordinal x axis', async () => {
      await common.expectChartAtUrlToMatchScreenshot(
        'http://localhost:9001/?path=/story/bar-chart--test-switch-ordinal-linear-axis&knob-scaleType=ordinal',
      );
    });
  });

  describe('[test] discover', () => {
    it('using no custom minInterval', async () => {
      await common.expectChartAtUrlToMatchScreenshot(
        'http://localhost:9001/?path=/story/bar-chart--test-discover&knob-use custom minInterval of 30s=',
      );
    });
  });

  describe('[test] histogram mode (linear)', () => {
    describe('enableHistogramMode is true', () => {
      eachRotation.it(async (rotation) => {
        await common.expectChartAtUrlToMatchScreenshot(
          `http://localhost:9001/?path=/story/bar-chart--test-histogram-mode-linear&knob-chartRotation=${rotation}&knob-bars padding=0.25&knob-histogram padding=0.05&knob-other series=line&knob-point series alignment=center&knob-hasHistogramBarSeries=&knob-debug=true&knob-bars-1 enableHistogramMode=true&knob-bars-2 enableHistogramMode=`,
        );
      });
    });

    describe('enableHistogramMode is false', () => {
      eachRotation.it(async (rotation) => {
        await common.expectChartAtUrlToMatchScreenshot(
          `http://localhost:9001/?path=/story/bar-chart--test-histogram-mode-linear&knob-chartRotation=${rotation}&knob-bars padding=0.25&knob-histogram padding=0.05&knob-other series=line&knob-point series alignment=center&knob-hasHistogramBarSeries=&knob-debug=true&knob-bars-1 enableHistogramMode=&knob-bars-2 enableHistogramMode=`,
        );
      });
    });

    describe('point alignment', () => {
      it('start', async () => {
        await common.expectChartAtUrlToMatchScreenshot(
          'http://localhost:9001/?path=/story/bar-chart--test-histogram-mode-linear&knob-chartRotation=-90&knob-bars padding=0.25&knob-histogram padding=0.05&knob-other series=area&knob-point series alignment=start&knob-hasHistogramBarSeries=true&knob-debug=true&knob-bars-1 enableHistogramMode=&knob-bars-2 enableHistogramMode=',
        );
      });
      it('center', async () => {
        await common.expectChartAtUrlToMatchScreenshot(
          'http://localhost:9001/?path=/story/bar-chart--test-histogram-mode-linear&knob-chartRotation=-90&knob-bars padding=0.25&knob-histogram padding=0.05&knob-other series=area&knob-point series alignment=center&knob-hasHistogramBarSeries=true&knob-debug=true&knob-bars-1 enableHistogramMode=&knob-bars-2 enableHistogramMode=',
        );
      });
      it('end', async () => {
        await common.expectChartAtUrlToMatchScreenshot(
          'http://localhost:9001/?path=/story/bar-chart--test-histogram-mode-linear&knob-chartRotation=-90&knob-bars padding=0.25&knob-histogram padding=0.05&knob-other series=area&knob-point series alignment=end&knob-hasHistogramBarSeries=true&knob-debug=true&knob-bars-1 enableHistogramMode=&knob-bars-2 enableHistogramMode=',
        );
      });
    });
  });

  describe('[test] histogram mode (ordinal)', () => {
    describe('enableHistogramMode is false, hasHistogramBarSeries is false', () => {
      eachRotation.it(async (rotation) => {
        await common.expectChartAtUrlToMatchScreenshot(
          `http://localhost:9001/?path=/story/bar-chart--test-histogram-mode-ordinal&knob-chartRotation=${rotation}&knob-bars padding=0.25&knob-hasHistogramBarSeries=&knob-debug=true&knob-bars-1 enableHistogramMode=true&knob-bars-2 enableHistogramMode=`,
        );
      });
    });

    describe('enableHistogramMode is true, hasHistogramBarSeries is true', () => {
      eachRotation.it(async (rotation) => {
        await common.expectChartAtUrlToMatchScreenshot(
          `http://localhost:9001/?path=/story/bar-chart--test-histogram-mode-ordinal&knob-chartRotation=${rotation}&knob-bars padding=0.25&knob-hasHistogramBarSeries=true&knob-debug=true&knob-bars-1 enableHistogramMode=true&knob-bars-2 enableHistogramMode=`,
        );
      });
    });
  });

  describe('different groupId', () => {
    it('render different axis scale', async () => {
      await common.expectChartAtUrlToMatchScreenshot(
        `http://localhost:9001/?path=/story/bar-chart--dual-axis-same-y-domain&knob-Apply a different groupId to some series=true&knob-Use the same data domain for each group=`,
      );
    });

    it('render the same domain with useDefaultGroupDomain', async () => {
      await common.expectChartAtUrlToMatchScreenshot(
        `http://localhost:9001/?path=/story/bar-chart--dual-axis-same-y-domain&knob-Apply a different groupId to some series=true&knob-Use the same data domain for each group=true`,
      );
    });
  });

  describe('value labels positioning', () => {
    it('clip both geometry and chart area values', async () => {
      await common.expectChartAtUrlToMatchScreenshot(
        'http://localhost:9001/?path=/story/bar-chart--with-value-label&knob-show single series=&knob-show value label=true&knob-alternating value label=&knob-contain value label within bar element=&knob-hide label if overflows chart edges=true&knob-hide label if overflows bar geometry=true&knob-debug=&knob-value font size=11&knob-value color=%23000&knob-offsetX=0&knob-offsetY=10&knob-data volume size=s&knob-split series=&knob-stacked series=&knob-chartRotation=0&knob-legend=right',
      );
    });
  });

  describe('value label positioning and formatting', () => {
    eachRotation.describe((rotation) => {
      describe.each<NonNullable<DisplayValueStyle['alignment']>['vertical']>([
        VerticalAlignment.Middle,
        VerticalAlignment.Top,
        VerticalAlignment.Bottom,
      ])('Vertical Alignment - %s', (verticalAlignment) => {
        describe.each<NonNullable<DisplayValueStyle['alignment']>['horizontal']>([
          HorizontalAlignment.Left,
          HorizontalAlignment.Center,
          HorizontalAlignment.Right,
        ])('Horizontal Alignment - %s', (horizontalAlignment) => {
          const url = `http://localhost:9001/?path=/story/bar-chart--data-value&args=&globals=theme:light&knob-chartRotation=${rotation}&knob-Horizontal alignment=${horizontalAlignment}&knob-Vertical alignment=${verticalAlignment}`;
          it('place the value labels on the correct area', async () => {
            await common.expectChartAtUrlToMatchScreenshot(url);
          });
        });
      });
    });
  });

  describe('functional accessors', () => {
    it('functional accessors with fieldName', async () => {
      await common.expectChartAtUrlToMatchScreenshot(
        'http://localhost:9001/?path=/story/bar-chart--functional-accessors&knob-y fn name=testY&knob-split fn name=testSplit',
      );
    });

    it('functional accessors with fieldName - with tooltip', async () => {
      await common.expectChartWithMouseAtUrlToMatchScreenshot(
        'http://localhost:9001/?path=/story/bar-chart--functional-accessors&knob-y fn name=testY&knob-split fn name=testSplit',
        {
          top: 60,
          right: 180,
        },
        {
          screenshotSelector: 'body',
        },
      );
    });

    it('y1Accessors and y0Accessors', async () => {
      await common.expectChartAtUrlToMatchScreenshot(
        'http://localhost:9001/?path=/story/bar-chart--band-bar-chart&knob-fit Y domain=true&knob-use fn accessors=true',
      );
    });
  });
  describe('custom bar width', () => {
    it('pixel size', async () => {
      await common.expectChartAtUrlToMatchScreenshot(
        'http://localhost:9001/?path=/story/stylings--custom-series-styles-bars&knob-apply bar style (bar 1 series)_Chart Global Theme=true&knob-enable custom rect width (px)_Bar width=true&knob-rect width (px)_Bar width=15&knob-enable custom rect width (ratio)_Bar width=&knob-rect width (ratio)_Bar width=0.5&knob-border stroke_Bar 1 Style=blue&knob-border strokeWidth_Bar 1 Style=2&knob-border visible_Bar 1 Style=true&knob-rect fill_Bar 1 Style=%2322C61A&knob-rect opacity_Bar 1 Style=0.3&knob-theme border stroke_Chart Global Theme=red&knob-theme border strokeWidth_Chart Global Theme=2&knob-theme border visible_Chart Global Theme=true&knob-theme opacity _Chart Global Theme=0.9',
      );
    });
    it('ratio size', async () => {
      await common.expectChartAtUrlToMatchScreenshot(
        'http://localhost:9001/?path=/story/stylings--custom-series-styles-bars&knob-apply bar style (bar 1 series)_Chart Global Theme=true&knob-enable custom rect width (px)_Bar width=&knob-rect width (px)_Bar width=30&knob-enable custom rect width (ratio)_Bar width=true&knob-rect width (ratio)_Bar width=0.5&knob-border stroke_Bar 1 Style=blue&knob-border strokeWidth_Bar 1 Style=2&knob-border visible_Bar 1 Style=true&knob-rect fill_Bar 1 Style=%2322C61A&knob-rect opacity_Bar 1 Style=0.3&knob-theme border stroke_Chart Global Theme=red&knob-theme border strokeWidth_Chart Global Theme=2&knob-theme border visible_Chart Global Theme=true&knob-theme opacity _Chart Global Theme=0.9',
      );
    });
    it('pixel and ratio size', async () => {
      await common.expectChartAtUrlToMatchScreenshot(
        'http://localhost:9001/?path=/story/stylings--custom-series-styles-bars&knob-apply bar style (bar 1 series)_Chart Global Theme=true&knob-enable custom rect width (px)_Bar width=true&knob-rect width (px)_Bar width=40&knob-enable custom rect width (ratio)_Bar width=true&knob-rect width (ratio)_Bar width=0.2&knob-border stroke_Bar 1 Style=blue&knob-border strokeWidth_Bar 1 Style=2&knob-border visible_Bar 1 Style=true&knob-rect fill_Bar 1 Style=%2322C61A&knob-rect opacity_Bar 1 Style=0.3&knob-theme border stroke_Chart Global Theme=red&knob-theme border strokeWidth_Chart Global Theme=2&knob-theme border visible_Chart Global Theme=true&knob-theme opacity _Chart Global Theme=0.9',
      );
    });
  });

  describe('domain padding', () => {
    it('should allow domain space padding', async () => {
      await common.expectChartAtUrlToMatchScreenshot(
        'http://localhost:9001/?path=/story/bar-chart--scale-to-extent&knob-yScaleDataToExtent=&knob-fit Y domain to data=true&knob-constrain padding=true&knob-domain padding=5&knob-Domain padding unit=domain&knob-data=all negative&knob-console log domains=true&knob-nice ticks=',
      );
    });
    it('should allow pixel space padding', async () => {
      await common.expectChartAtUrlToMatchScreenshot(
        'http://localhost:9001/?path=/story/bar-chart--scale-to-extent&knob-yScaleDataToExtent=&knob-fit Y domain to data=true&knob-constrain padding=true&knob-domain padding=100&knob-Domain padding unit=pixel&knob-data=all negative&knob-console log domains=true&knob-nice ticks=',
      );
    });
    it('should apply padding with positive and negative values', async () => {
      await common.expectChartAtUrlToMatchScreenshot(
        'http://localhost:9001/?path=/story/bar-chart--scale-to-extent&knob-fit Y domain to data=true&knob-constrain padding=true&knob-nice ticks=&knob-domain padding=50&knob-Domain padding unit=pixel&knob-data=mixed&knob-SeriesType=bar&knob-console log domains=true',
      );
    });
    it('should apply padding within intersept - positive values', async () => {
      await common.expectChartAtUrlToMatchScreenshot(
        'http://localhost:9001/?path=/story/bar-chart--scale-to-extent&knob-fit Y domain to data=true&knob-constrain padding=true&knob-nice ticks=&knob-domain padding=50&knob-Domain padding unit=pixel&knob-data=all positive&knob-SeriesType=line&knob-console log domains=true',
      );
    });
    it('should constrain padding to intersept - positive values', async () => {
      await common.expectChartAtUrlToMatchScreenshot(
        'http://localhost:9001/?path=/story/bar-chart--scale-to-extent&knob-fit Y domain to data=true&knob-constrain padding=true&knob-nice ticks=&knob-domain padding=100&knob-Domain padding unit=pixel&knob-data=all positive&knob-SeriesType=line&knob-console log domains=true',
      );
    });
    it('should apply padding within intersept - negative values', async () => {
      await common.expectChartAtUrlToMatchScreenshot(
        'http://localhost:9001/?path=/story/bar-chart--scale-to-extent&knob-fit Y domain to data=true&knob-constrain padding=true&knob-nice ticks=&knob-domain padding=50&knob-Domain padding unit=pixel&knob-data=all negative&knob-SeriesType=line&knob-console log domains=true',
      );
    });
    it('should constrain padding to intersept - negative values', async () => {
      await common.expectChartAtUrlToMatchScreenshot(
        'http://localhost:9001/?path=/story/bar-chart--scale-to-extent&knob-fit Y domain to data=true&knob-constrain padding=true&knob-nice ticks=&knob-domain padding=100&knob-Domain padding unit=pixel&knob-data=all negative&knob-SeriesType=line&knob-console log domains=true',
      );
    });
    it('should allow domain ratio padding', async () => {
      await common.expectChartAtUrlToMatchScreenshot(
        'http://localhost:9001/?path=/story/bar-chart--scale-to-extent&knob-yScaleDataToExtent=&knob-fit Y domain to data=true&knob-constrain padding=true&knob-domain padding=0.5&knob-Domain padding unit=domainRatio&knob-data=all negative&knob-console log domains=true&knob-nice ticks=',
      );
    });
    it('should nice ticks after domain padding is applied', async () => {
      await common.expectChartAtUrlToMatchScreenshot(
        'http://localhost:9001/?path=/story/bar-chart--scale-to-extent&knob-yScaleDataToExtent=&knob-fit Y domain to data=true&knob-constrain padding=&knob-domain padding=100&knob-Domain padding unit=pixel&knob-data=all negative&knob-console log domains=true&knob-nice ticks=true',
      );
    });
  });
  describe('Stacked bars configs', () => {
    it('percentage stacked with internal fn', async () => {
      await common.expectChartAtUrlToMatchScreenshot(
        'http://localhost:9001/?path=/story/bar-chart--stacked-as-percentage&globals=theme:light&knob-mode=stackAsPercentage&knob-use computeRatioByGroups fn=',
      );
    });
    it('percentage stacked with external fn', async () => {
      await common.expectChartAtUrlToMatchScreenshot(
        'http://localhost:9001/?path=/story/bar-chart--stacked-as-percentage&globals=theme:light&knob-mode=stackAsPercentage&knob-use computeRatioByGroups fn=true',
      );
    });
    it('non stacked with external fn', async () => {
      await common.expectChartAtUrlToMatchScreenshot(
        'http://localhost:9001/?path=/story/bar-chart--stacked-as-percentage&globals=theme:light&knob-mode=unstacked&knob-use computeRatioByGroups fn=true',
      );
    });
  });
});
