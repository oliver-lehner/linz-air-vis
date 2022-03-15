import { spring } from 'svelte/motion';
import { writable } from 'svelte/store';

export const currentStation = writable<string>(undefined);

export const poi = spring({ x: 0, y: 0, z: 0 }, { stiffness: 0.2, damping: 0.8 });
export const camPos = spring({ x: 0, y: 2, z: 5 }, { stiffness: 0.2, damping: 0.8 });
