"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = __importDefault(require("events"));
var lodash_1 = __importDefault(require("lodash"));
var logger_1 = __importDefault(require("./logger"));
var model_1 = require("./model");
/**
 * Abstract emitter class to emit high level detections for consumer apps.
 */
var AbstractBeaconDetector = /** @class */ (function (_super) {
    __extends(AbstractBeaconDetector, _super);
    /**
     * Instantiates a new {@code BeaconEmitter}.
     *
     * @param config - The config object to use
     */
    function AbstractBeaconDetector(config) {
        var _this = _super.call(this) || this;
        _this.beacons = new Map();
        _this.config = new model_1.Config(config);
        _this.lastReportedBeacons = [];
        // Binding this
        _this.onDiscover = _this.onDiscover.bind(_this);
        _this.onScanStart = _this.onScanStart.bind(_this);
        _this.onScanStartError = _this.onScanStartError.bind(_this);
        _this.onScanStop = _this.onScanStop.bind(_this);
        _this.reportBeacons = _this.reportBeacons.bind(_this);
        return _this;
    }
    /**
     * Internal callback to handle discovered devices.
     *
     * @param manufacturerData - The hex format manufacturer data of the beacon.
     */
    AbstractBeaconDetector.prototype.onDiscover = function (manufacturerData, rssi) {
        var beacon = model_1.Beacon.parse(manufacturerData, rssi);
        if (beacon && beacon.uuid === this.config.beaconUUID) {
            this.beacons.set(beacon.joinCode, beacon);
        }
    };
    /**
     * Internal callback to handle the start of the scanning.
     */
    AbstractBeaconDetector.prototype.onScanStart = function () {
        this.reporterTimer = setInterval(this.reportBeacons, this.config.reportIntervalMillisecs);
        logger_1.default.info('Spot BLE scanning started.');
        this.emit('scanStart');
    };
    /**
     * Internal callback to handle the error of starting the scanning.
     *
     * @param error The error thrown, if any.
     */
    AbstractBeaconDetector.prototype.onScanStartError = function (error) {
        this.emit('scanStartError', error);
    };
    /**
     * Internal callback to handle the stop of the scanning.
     */
    AbstractBeaconDetector.prototype.onScanStop = function () {
        clearInterval(this.reporterTimer);
        this.beacons.clear();
        this.lastReportedBeacons = [];
        logger_1.default.info('Spot BLE scanning stopped.');
        this.emit('scanStop');
    };
    /**
     * A timed function to report the current state of the detection (if need be) for SDK consumers.
     */
    AbstractBeaconDetector.prototype.reportBeacons = function () {
        // First, cleaning up all beacons that we didn't see for a given time.
        var valuesIterator = this.beacons.values();
        var now = Date.now();
        var beacon;
        while ((beacon = valuesIterator.next().value) !== undefined) {
            if (beacon.lastSeen < now - (this.config.beaconDismissTimeoutSeconds * 1000)) {
                this.beacons.delete(beacon.joinCode);
            }
        }
        // Now create an array of remaining beacons and compare the changes
        // If there's a difference, we report the new list
        var sortedBeaconsArray = lodash_1.default.sortBy(Array.from(this.beacons.values()), ['uuid', 'joinCode']);
        if (this.shouldReportNewList(sortedBeaconsArray)) {
            this.emit('beacons', sortedBeaconsArray);
            logger_1.default.info('Beacons detected.', sortedBeaconsArray);
            // Please note: lastReportedBeacons is always sorted
            this.lastReportedBeacons = sortedBeaconsArray;
            // We also need to report the current best detection
            if (sortedBeaconsArray.length) {
                var bestBeacon = lodash_1.default.nth(lodash_1.default.sortBy(sortedBeaconsArray, ['distance']), -1);
                if (bestBeacon && (!this.lastReportedBestBeacon
                    || bestBeacon.joinCode !== this.lastReportedBestBeacon.joinCode
                    || bestBeacon.proximity !== this.lastReportedBestBeacon.proximity)) {
                    this.emit('bestBeacon', bestBeacon);
                    logger_1.default.info('Best beacon updated.', bestBeacon);
                    this.lastReportedBestBeacon = bestBeacon;
                }
            }
            else {
                // There is no best beacon
                logger_1.default.info('There is no current best beacon.');
                this.emit('bestBeacon', undefined);
                this.lastReportedBestBeacon = undefined;
            }
        }
    };
    /**
     * Function to decide if the SDK should report a new list of beacons.
     *
     * @param newList - The list of currently available (detected) beacons.
     * @return {boolean}
     */
    AbstractBeaconDetector.prototype.shouldReportNewList = function (newList) {
        if (newList.length !== this.lastReportedBeacons.length) {
            // Device count changed, we need to report for sure.
            return true;
        }
        for (var i = 0; i < newList.length; i++) {
            var b1 = newList[i];
            var b2 = this.lastReportedBeacons[i];
            if (!b1.isEqual(b2)) {
                // There is at least one different device.
                return true;
            }
        }
        return false;
    };
    return AbstractBeaconDetector;
}(events_1.default));
exports.default = AbstractBeaconDetector;
