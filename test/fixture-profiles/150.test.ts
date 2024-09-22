import {
  exclusively,
  generateBasicPatch,
  partially,
  testCommandSet,
} from "./profile-test-utils";
import oneFifties from "../../src/fixture-profiles/150";

testCommandSet(() => generateBasicPatch(oneFifties), "test.intensity.$$", {
  "255": partially({ 20: 255 }),
  "0": partially({ 20: 0 }),
  "3000": exclusively({}),
});

testCommandSet(() => generateBasicPatch(oneFifties), "test.colour.$$", {
  "0.0.0": exclusively({ 7: 0, 9: 0, 11: 0 }),
  "0.0.0.0": exclusively({ 7: 0, 9: 0, 11: 0, 13: 0 }),
  "255.255.255": exclusively({ 7: 255, 9: 255, 11: 255 }),
  "255.255.255.255": exclusively({ 7: 255, 9: 255, 11: 255, 13: 255 }),
  "256.255.255.255": exclusively({}),
  "255.255.255.255.255": exclusively({}),
  "1.2.3": exclusively({ 7: 1, 9: 2, 11: 3 }),
  "1.2.3.4": exclusively({ 7: 1, 9: 2, 11: 3, 13: 4 }),
  "255.255": exclusively({}),
  green: exclusively({}),
});
