"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var jitsi_meet_logger_1 = __importDefault(require("@jitsi/jitsi-meet-logger"));
/**
 * An instantiated and configured {@code jitsi-meet-logger} instance.
 */
exports.default = jitsi_meet_logger_1.default.getLogger('spot-electron-sdk', undefined, {
    disableCallerInfo: true
});
