"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROXIMITY = {
    IMMEDIATE: 'immediate',
    NEAR: 'near',
    FAR: 'far',
    UNKNOWN: 'unknown'
};
/**
 * Class represents a Beacon we work with.
 */
var Beacon = /** @class */ (function () {
    /**
     * Instantiates a new Beacon object.
     *
     * @param uuid - The beacon uuid of the device.
     * @param joinCode - The join code transmitted via major and minor version bytes.
     * @param distance - The calculated distance of the device in meters.
     * @param proximity - The string representation of the proximity of the device, based on the distance.
     */
    function Beacon(uuid, joinCode, distance, proximity) {
        this.uuid = uuid;
        this.joinCode = joinCode;
        this.distance = distance;
        this.proximity = proximity;
        this.lastSeen = Date.now();
    }
    /**
     * Returns a distance rounded to .1 metres.
     */
    Beacon.prototype.getRoundedDistance = function () {
        return Math.round(this.distance * 10) / 10;
    };
    /**
     * Returns true if the two beacons are equal using a lenient comparison.
     *
     * @param b - The other Beacon object.
     */
    Beacon.prototype.isEqual = function (b) {
        return b
            && b.uuid === this.uuid
            && b.joinCode === this.joinCode
            && b.getRoundedDistance() === this.getRoundedDistance();
    };
    /**
     * Returns a string representation of the device. Used for debugging and logging purposes.
     */
    Beacon.prototype.toString = function () {
        return "UUID: " + this.uuid + " CODE: " + this.joinCode + " PROXIMITY: " + this.proximity;
    };
    /**
     * Static factory function to parse a raw device into a Spot Beacon, or return null if it's not a compatible device.
     *
     * @param dataString - The raw hex data of the detected device.
     */
    Beacon.parse = function (dataString, rssi) {
        // data structure:
        // < 8 bytes  manufacturer string >
        // < 32 bytes UUID >
        // < 4 bytes major version >
        // < 4 bytes minor version >
        // < 2 bytes transmit power >
        var uuid = dataString.substr(0, 8) + "-" + dataString.substr(8, 4) + "-" + dataString.substr(12, 4) + "-" + dataString.substr(16, 4) + "-" + dataString.substr(20, 12);
        var major = dataString.substr(32, 4);
        var minor = dataString.substr(36, 4);
        // Join code is stored with base 36 to base 16 transformation, so needs to be reverse-transformed
        var joinCode = parseInt("" + major + minor, 16).toString(36);
        var power = parseInt(dataString.substr(40, 2), 16) - 256;
        // Based on https://www.rn.inf.tu-dresden.de/dargie/papers/icwcuca.pdf
        var distance = Math.pow(10, (power - rssi) / (10 * 2));
        var proximity;
        if (distance < 1) {
            proximity = exports.PROXIMITY.IMMEDIATE;
        }
        else if (distance < 3) {
            proximity = exports.PROXIMITY.NEAR;
        }
        else {
            proximity = exports.PROXIMITY.FAR;
        }
        return new Beacon(uuid, joinCode, distance, proximity);
    };
    return Beacon;
}());
exports.default = Beacon;
