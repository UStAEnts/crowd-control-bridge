import { animator } from "./animator";

export default animator(
  "sin",
  (t) => (100 / 2) * Math.sin(0.02463994238 * t) + 100 / 2,
);
