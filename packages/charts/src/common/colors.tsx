/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { RgbaTuple } from './color_library_wrappers';

/**
 * A CSS color keyword or a numerical representation (hex, rgb, rgba, hsl, hsla)
 * @public
 */
export type Color = string; // todo static/runtime type it this for proper color string content; several places in the code, and ultimate use, dictate it not be an empty string

/** @internal */
export const Colors: Record<string, { keyword: Color; rgba: RgbaTuple }> = {
  Red: {
    keyword: 'red',
    rgba: [255, 0, 0, 1],
  },
  White: {
    keyword: 'white',
    rgba: [255, 255, 255, 1],
  },
  Black: {
    keyword: 'black',
    rgba: [0, 0, 0, 1],
  },
  Transparent: {
    keyword: 'transparent',
    rgba: [0, 0, 0, 0],
  },
};
