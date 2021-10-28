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
var noble_1 = __importDefault(require("@abandonware/noble"));
var AbstractBeaconDetector_1 = __importDefault(require("./AbstractBeaconDetector"));
var logger_1 = __importDefault(require("./logger"));
// Mac specific beacon device ID.
var BEACON_DEVICE_ID = '4c000215';
// Noble state required to start scanning.
var START_REQUIRED_STATE = 'poweredOn';
/**
 * Base emitter class to emit high level detections for consumer apps.
 */
var BeaconDetector = /** @class */ (function (_super) {
    __extends(BeaconDetector, _super);
    /**
     * Instantiates a new BeaconDetector instance.
     *
     * @inheritdoc
     */
    function BeaconDetector(config) {
        var _this = _super.call(this, config) || this;
        _this.setEventListeners();
        return _this;
    }
    /**
     * Sets the event listeners.
     */
    BeaconDetector.prototype.setEventListeners = function () {
        var _this = this;
        noble_1.default.on('discover', function (peripherial) {
            // parse manufacturer data here
            var manufacturerData = peripherial.advertisement.manufacturerData;
            if (!manufacturerData) {
                // This is not a beacon
                return;
            }
            var dataString = manufacturerData.toString('hex').toLowerCase();
            if (!dataString.startsWith(BEACON_DEVICE_ID)) {
                // This is not a beacon
                return;
            }
            var rawData = dataString.substr(8);
            _this.onDiscover(rawData, peripherial.rssi);
        });
        noble_1.default.on('scanStart', this.onScanStart);
        noble_1.default.on('scanStop', this.onScanStop);
    };
    /**
     * Function to start the device detection.
     */
    BeaconDetector.prototype.start = function () {
        var _this = this;
        this.waitForPoweredOn().then(function () {
            noble_1.default.startScanning([], true, function (error) {
                if (error) {
                    _this.onScanStartError(error);
                    logger_1.default.error('Error starting beacon scanner.', error);
                }
            });
        });
    };
    /**
     * Functio to stop the device detection.
     */
    BeaconDetector.prototype.stop = function () {
        noble_1.default.stopScanning();
    };
    /**
     * Ensures that the bluetooth hardware is in powered on state.
     */
    BeaconDetector.prototype.waitForPoweredOn = function () {
        if (noble_1.default.state === START_REQUIRED_STATE) {
            return Promise.resolve();
        }
        return new Promise(function (resolve) {
            noble_1.default.on('stateChange', function (state) {
                if (state === START_REQUIRED_STATE) {
                    resolve();
                }
            });
        });
    };
    return BeaconDetector;
}(AbstractBeaconDetector_1.default));
exports.default = BeaconDetector;
