/**
 * Plain mutable object the chapter timeline tweens and the WebGL scene reads
 * every frame. Values are in radians / world units; `enter` and `coinSpread`
 * are normalized 0 → 1.
 */
export type PhoneRig = {
  rotX: number;
  rotY: number;
  rotZ: number;
  y: number;
  z: number;
  enter: number;
  coinSpread: number;
};

/** Defaults match the final frame so a non-animated render is complete. */
export const createPhoneRig = (): PhoneRig => ({
  rotX: 0.03,
  rotY: 0.2,
  rotZ: 0,
  y: 0,
  z: 0,
  enter: 1,
  coinSpread: 1,
});
