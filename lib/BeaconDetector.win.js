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
var lodash_1 = __importDefault(require("lodash"));
var windows_devices_bluetooth_advertisement_1 = __importDefault(require("@jitsi/windows.devices.bluetooth.advertisement"));
var windows_storage_streams_1 = __importDefault(require("@jitsi/windows.storage.streams"));
var AbstractBeaconDetector_1 = __importDefault(require("./AbstractBeaconDetector"));
var logger_1 = __importDefault(require("./logger"));
// Windows specific beacon device ID.
var BEACON_DEVICE_ID = '0215';
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
        _this.watcher = new windows_devices_bluetooth_advertisement_1.default.BluetoothLEAdvertisementWatcher();
        _this.watcher.ScanningMode = windows_devices_bluetooth_advertisement_1.default.BluetoothLEScanningMode.active;
        _this.setEventListeners();
        return _this;
    }
    /**
     * Sets the event listeners.
     */
    BeaconDetector.prototype.setEventListeners = function () {
        var _this = this;
        this.watcher.on('Received', function (watcher, args) {
            if (!args.advertisement.manufacturerData.size) {
                // This is not a beacon.
                return;
            }
            var manufacturerData = args.advertisement.manufacturerData.getAt(0).data;
            var reader = windows_storage_streams_1.default.DataReader.fromBuffer(manufacturerData);
            var hexValue = [];
            while (reader.unconsumedBufferLength) {
                hexValue.push(lodash_1.default.padStart(reader.readByte().toString(16), 2, '0'));
            }
            var manufecturerDataString = hexValue.join('');
            if (!manufecturerDataString.startsWith(BEACON_DEVICE_ID)) {
                // This is not a beacon.
                return;
            }
            reader.close();
            _this.onDiscover(manufecturerDataString.substr(4), args.rawSignalStrengthInDBm);
        });
        this.watcher.on('Stopped', this.onScanStop);
        // this API doesn't provide a 'Started' event
    };
    /**
     * Function to start the device detection.
     */
    BeaconDetector.prototype.start = function () {
        try {
            this.watcher.start();
            // This API doesn't provide a 'Started' event, so we fake it, assuming that
            // if we don't run into an error by here, we're good.
            this.onScanStart();
        }
        catch (error) {
            logger_1.default.error('Error starting beacon scanner.', error);
            this.onScanStartError(error);
        }
    };
    /**
     * Functio to stop the device detection.
     */
    BeaconDetector.prototype.stop = function () {
        this.watcher.stop();
    };
    return BeaconDetector;
}(AbstractBeaconDetector_1.default));
exports.default = BeaconDetector;
