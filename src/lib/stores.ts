import { spring } from 'svelte/motion';
import { readable } from 'svelte/store';
import { getLuftiPositions } from './utils';

export const poi = spring({ x: 0, y: 0, z: 0 }, { stiffness: 0.2, damping: 0.5 });
export const camPos = spring({ x: 0, y: 2, z: 5 });
