import { writable } from "svelte/store";
import type { Vec3 } from "./particles/types";

export const positions=writable({"S184":<Vec3>[0,0,0], "S415":<Vec3>[0,1,0], "S416":<Vec3>[0,0,0], "S431":<Vec3>[0,0,0],});