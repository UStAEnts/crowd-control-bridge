/**
 * Animators are simple effects that run on a loop. They take the current time and return the state of the effect
 * at that time. Animators should be pure (ie stateless), or be careful about state as there is no guarantees that
 * time steps are consistent, or even move positively.
 */
export type Animator = ((t: number) => number) & {
  identifier: string;
  initial?: number;
};

export function animator(
  identifier: string,
  executor: (t: number) => number,
  initial: number = 0,
): Animator {
  return Object.assign(executor, {
    identifier,
    initial,
  });
}
