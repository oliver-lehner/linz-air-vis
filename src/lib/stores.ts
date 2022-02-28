import { spring } from 'svelte/motion';
import { writable, readable } from 'svelte/store';
import { getLuftiPositions } from './utils';



export const currentStation = writable<string>(undefined);