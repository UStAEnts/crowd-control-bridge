import { GeneratedProfile, Profile } from "../../src/fixture-profiles/profile";
import { pureEntries } from "../../src/util";
import { expect, test } from "vitest";

const effectProxy = new Proxy({} as Record<string, number>, {
  get: () => {
    return 0;
  },
});

export function generateBasicPatch(
  generator: Profile,
  effects: Record<string, number> = effectProxy,
  prefix: string = "test",
): GeneratedProfile {
  return generator(prefix, { 0: [0] }, effects);
}

export const exclusively = (dmx: Record<number, number>) => ({
  exclusive: true,
  expected: dmx,
});
export const partially = (dmx: Record<number, number>) => ({
  exclusive: false,
  expected: dmx,
});

export function expectCommandToWriteDMX(
  profile: GeneratedProfile,
  command: string,
  expected: Record<number, number>,
  exclusive: boolean = true,
) {
  const dmx = profile.processor(0, command);
  const entries = pureEntries(expected);

  console.log(dmx, expected);

  if (exclusive) {
    expect(pureEntries(dmx).length).toBe(entries.length);
  }

  for (const [k, v] of entries) {
    expect(dmx).toHaveProperty(String(k));
    expect(dmx[k]).toBe(v);
  }
}

export function testCommandSet(
  generator: () => GeneratedProfile,
  commandTemplate: string,
  expected: Record<
    string,
    | Record<number, number>
    | {
        exclusive: boolean;
        expected: Record<number, number>;
      }
  >,
) {
  const entries = pureEntries(expected);
  for (const [substitute, testCase] of entries) {
    const command = commandTemplate.replace("$$", substitute);
    test("command " + command + " produces the correct dmx", () => {
      const profile = generator();
      if ("exclusive" in testCase) {
        expectCommandToWriteDMX(
          profile,
          command,
          testCase.expected,
          testCase.exclusive,
        );
      } else {
        expectCommandToWriteDMX(profile, command, testCase);
      }
    });
  }
}
