/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { groupBy, GroupKeysOrKeyFn } from '../../chart_types/xy_chart/utils/group_data_series';
import { isFiniteNumber } from '../common';

/**
 * The function computes the participation ratio of a value in the total sum of its membership group.
 * It returns a shallow copy of the input array where each object is augmented with the computed ratio.
 *
 * @remarks
 * The ratio is computed using absolute values.
 * Product A made a profit of $200, and product B has a loss of $300. In total, the company lost $100 ($200 – $300).
 * Product A has a weight of: abs(200) / ( abs(200) + abs(-300) ) * 100% = 40%
 * Product B has a weight of: abs(-300) / ( abs(200) + abs(-300) ) * 100% = 60%
 * Product A and product B have respectively a weight of 40% and 60% in the formation of the overall total loss of $100.
 *
 * We don't compute the ratio for non-finite values. In this case, we return the original non-finite value.
 *
 * If the sum of the group values is 0, each ratio is considered 0.
 *
 * @public
 * @param data - an array of objects
 * @param groupAccessors - an array of accessor keys or a fn to describe an unique id for each group
 * @param valueAccessor - a fn that returns the value to use
 * @param ratioKeyName - the object key used to store the computed ratio
 */
export function computeRatioByGroups<T extends Record<string, unknown>>(
  data: T[],
  groupAccessors: GroupKeysOrKeyFn<T>,
  valueAccessor: (k: T) => number | null | undefined,
  ratioKeyName: string,
) {
  return groupBy(data, groupAccessors, true)
    .map((groupedData) => {
      const groupSum = groupedData.reduce((sum, datum) => {
        const value = valueAccessor(datum);
        return sum + (isFiniteNumber(value) ? Math.abs(value) : 0);
      }, 0);
      return groupedData.map((datum) => {
        const value = valueAccessor(datum);
        return {
          ...datum,
          // if the value is null/undefined we don't compute the ratio, we just return the original null/undefined value
          [ratioKeyName]: isFiniteNumber(value) ? (groupSum === 0 ? 0 : Math.abs(value) / groupSum) : value,
        };
      });
    })
    .flat();
}
