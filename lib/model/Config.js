"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Model class representing the configuration of the SDK.
 */
var Config = /** @class */ (function () {
    /**
     * Instantiates a new {@code Config} instance.
     *
     * @param {string} baseURL - The base URL to be used when connecting to the Spot instance (e.g. spot.jitsi.net).
     * @param {string} beaconUUID - The beacon UUID to be used for ranging.
     */
    function Config(config) {
        if (config === void 0) { config = {}; }
        this.beaconUUID = config.beaconUUID || 'bf23c311-24ae-414b-b153-cf097836947f';
        this.beaconDismissTimeoutSeconds = Math.max(config.beaconDismissTimeoutSeconds || 10, 5);
        this.reportIntervalMillisecs = Math.max(config.reportIntervalMillisecs || 2000, 2000);
    }
    return Config;
}());
exports.default = Config;
