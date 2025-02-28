/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { LegendItem } from '../../../../common/legend';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getLegendConfigSelector } from '../../../../state/selectors/get_legend_config_selector';
import { getLegendItems } from '../../layout/utils/legend';
import { partitionMultiGeometries } from './geometries';
import { getPartitionSpecs } from './get_partition_specs';

/** @internal */
export const computeLegendSelector = createCustomCachedSelector(
  [getPartitionSpecs, getLegendConfigSelector, partitionMultiGeometries],
  (specs, { flatLegend, legendMaxDepth, legendPosition }, geometries): LegendItem[] =>
    specs.flatMap((partitionSpec, i) => {
      const quadViewModel = geometries.filter((g) => g.index === i).flatMap((g) => g.quadViewModel);
      return getLegendItems(
        partitionSpec.id,
        partitionSpec.layers,
        flatLegend,
        legendMaxDepth,
        legendPosition,
        quadViewModel,
        partitionSpec.config.partitionLayout,
      );
    }),
);
