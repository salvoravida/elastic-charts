/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { LEGEND_HIERARCHY_MARGIN } from '../../components/legend/legend_item';
import { LEGEND_TO_FULL_CONFIG } from '../../components/legend/position_style';
import { LegendPositionConfig } from '../../specs/settings';
import { withTextMeasure } from '../../utils/bbox/canvas_text_bbox_calculator';
import { Position, isDefined, LayoutDirection } from '../../utils/common';
import { Size } from '../../utils/dimensions';
import { GlobalChartState } from '../chart_state';
import { createCustomCachedSelector } from '../create_selector';
import { getChartThemeSelector } from './get_chart_theme';
import { getLegendConfigSelector } from './get_legend_config_selector';
import { getLegendItemsLabelsSelector } from './get_legend_items_labels';

const getParentDimensionSelector = (state: GlobalChartState) => state.parentDimensions;

const SCROLL_BAR_WIDTH = 16; // ~1em
const MARKER_WIDTH = 16;
const SHARED_MARGIN = 4;
const VERTICAL_PADDING = 4;
const TOP_MARGIN = 2;
const MAGIC_FONT_FAMILY =
  '"Inter UI", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';

/** @internal */
export type LegendSizing = Size & {
  margin: number;
  position: LegendPositionConfig;
};

/** @internal */
export const getLegendSizeSelector = createCustomCachedSelector(
  [getLegendConfigSelector, getChartThemeSelector, getParentDimensionSelector, getLegendItemsLabelsSelector],
  (legendConfig, theme, parentDimensions, labels): LegendSizing => {
    if (!legendConfig.showLegend) {
      return { width: 0, height: 0, margin: 0, position: LEGEND_TO_FULL_CONFIG[Position.Right] };
    }

    const bbox = withTextMeasure((textMeasure) =>
      labels.reduce(
        (acc, { label, depth }) => {
          const { width, height } = textMeasure(label, 1, 12, MAGIC_FONT_FAMILY, 1.5, 400);
          acc.width = Math.max(acc.width, width + depth * LEGEND_HIERARCHY_MARGIN);
          acc.height = Math.max(acc.height, height);
          return acc;
        },
        { width: 0, height: 0 },
      ),
    );

    const { showLegendExtra: showLegendDisplayValue, legendPosition, legendAction } = legendConfig;
    const {
      legend: { verticalWidth, spacingBuffer, margin },
    } = theme;

    const actionDimension = isDefined(legendAction) ? 24 : 0; // max width plus margin
    const legendItemWidth = MARKER_WIDTH + SHARED_MARGIN + bbox.width + (showLegendDisplayValue ? SHARED_MARGIN : 0);

    if (legendPosition.direction === LayoutDirection.Vertical) {
      const legendItemHeight = bbox.height + VERTICAL_PADDING * 2;
      const legendHeight = legendItemHeight * labels.length + TOP_MARGIN;
      const scrollBarDimension = legendHeight > parentDimensions.height ? SCROLL_BAR_WIDTH : 0;

      return {
        width: Math.floor(
          Math.min(legendItemWidth + spacingBuffer + actionDimension + scrollBarDimension, verticalWidth),
        ),
        height: legendHeight,
        margin,
        position: legendPosition,
      };
    }
    const isSingleLine = (parentDimensions.width - 20) / 200 > labels.length;
    return {
      height: isSingleLine ? bbox.height + 16 : bbox.height * 2 + 24,
      width: Math.floor(Math.min(legendItemWidth + spacingBuffer + actionDimension, verticalWidth)),
      margin,
      position: legendPosition,
    };
  },
);
