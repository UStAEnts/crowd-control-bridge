const config = {
  lightingInterface: "172.18.0.13",
  crowdcontrolServer: "http://127.0.0.1:3001",
  /**
   * When set to true, address 1 in the patch will be treated as address 0 (if -1). This is useful when your matches are
   * 1 indexed but you're writing out to artnet which is 0 indexed.
   */
  mapAddress1To0: true,
} as const;

export default config;
