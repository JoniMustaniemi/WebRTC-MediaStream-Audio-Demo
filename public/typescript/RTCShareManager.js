"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var ConnectionManager = /** @class */ (function () {
    function ConnectionManager(options) {
        this.options = options;
    }
    ConnectionManager.prototype.startConnection = function (liveModeStatus, client) {
        if (client == "1") {
            this.liveModeStatus_client_1 = liveModeStatus;
            if (!this.RTCPeerConnection_client_1) {
                this.RTCPeerConnection_client_1 = new Connection("1", this.options);
                this.RTCPeerConnectionObject_client_1 = this.RTCPeerConnection_client_1.client.object;
                this.datachannel = this.RTCPeerConnectionObject_client_1.createDataChannel("channel1");
                this.setEventHandlers("1");
            }
        }
        else if (client == "2") {
            this.liveModeStatus_client_2 = liveModeStatus;
            if (!this.RTCPeerConnection_client_2) {
                this.RTCPeerConnection_client_2 = new Connection("2", this.options);
                this.RTCPeerConnectionObject_client_2 = this.RTCPeerConnection_client_2.client.object;
                this.setEventHandlers("2");
            }
        }
        return;
    };
    ConnectionManager.prototype.setEventHandlers = function (client) {
        var _this = this;
        if (client == "1") {
            this.RTCPeerConnectionObject_client_1.onicecandidate = function (event) {
                if (event.candidate) {
                    try {
                        _this.RTCPeerConnectionObject_client_2.addIceCandidate(event.candidate);
                    }
                    catch (error) {
                        console.log(error);
                        return;
                    }
                }
                else {
                    console.log("all candidates sent by client 1");
                    if (_this.RTCPeerConnectionObject_client_1.iceConnectionState === "new" && _this.RTCPeerConnectionObject_client_2.iceConnectionState === "new") {
                        _this.stopLiveMode({
                            restart: true
                        });
                    }
                }
            };
            this.RTCPeerConnectionObject_client_1.onnegotiationneeded = function () {
                if (_this.liveModeStatus_client_1 && _this.liveModeStatus_client_2) {
                    _this.createOffer(_this.RTCPeerConnectionObject_client_1, "1");
                }
            };
            this.RTCPeerConnectionObject_client_1.addEventListener("iceconnectionstatechange", function (ev) {
                if (_this.RTCPeerConnectionObject_client_1) {
                    if (_this.RTCPeerConnectionObject_client_1.iceConnectionState === "disconnected") {
                        _this.RTCPeerConnectionObject_client_1.close();
                        _this.RTCPeerConnectionObject_client_1 = null;
                    }
                    if (_this.RTCPeerConnectionObject_client_1.iceConnectionState === "connected") {
                        console.log("client 1 connected");
                    }
                    if (_this.RTCPeerConnectionObject_client_1.iceConnectionState === "closed") {
                        return;
                    }
                }
            }, false);
            this.datachannel.onopen = function (event) {
                _this.handleDataChannelOpen(event, "1");
            };
            this.datachannel.onerror = this.handleDataChannelError;
            this.datachannel.onclose = function (event) {
                _this.handleDataChannelClose();
            };
        }
        else if (client == "2") {
            this.RTCPeerConnectionObject_client_2.addEventListener("iceconnectionstatechange", function (ev) {
                if (_this.RTCPeerConnectionObject_client_2) {
                    if (_this.RTCPeerConnectionObject_client_2.iceConnectionState === "disconnected" || _this.RTCPeerConnectionObject_client_2.iceConnectionState === "closed") {
                        _this.RTCPeerConnectionObject_client_2.close();
                    }
                    if (_this.RTCPeerConnectionObject_client_2.iceConnectionState === "connected") {
                        console.log("client 2 connected");
                    }
                }
            }, false);
            this.RTCPeerConnectionObject_client_2.onicecandidate = function (event) {
                if (event.candidate) {
                    try {
                        _this.RTCPeerConnectionObject_client_1.addIceCandidate(event.candidate);
                    }
                    catch (error) {
                        console.log(error);
                    }
                }
                else {
                    console.log("all candidates sent by client 2");
                }
            };
            this.RTCPeerConnectionObject_client_2.ontrack = function (event) {
                if (typeof _this.options.event_handlers.on_audio_receive === 'function') {
                    _this.options.event_handlers.on_audio_receive({});
                }
                _this.onReceiveAudio({
                    event: event
                });
            };
        }
    };
    ConnectionManager.prototype.handleDataChannelOpen = function (event, client) {
        if (client == "1") {
            console.log("Datachannel is open");
        }
        if (this.datachannel) {
            if (this.datachannel.readyState == "open") {
                if (typeof this.options.event_handlers.on_established_connection === 'function') {
                    this.options.event_handlers.on_established_connection({});
                }
            }
        }
        else {
            return;
        }
    };
    ConnectionManager.prototype.handleDataChannelError = function (error) {
        console.log(error);
    };
    ConnectionManager.prototype.handleDataChannelClose = function () {
        console.log("datachannel closed");
        if (typeof this.options.event_handlers.on_datachannel_close === 'function') {
            this.options.event_handlers.on_datachannel_close({});
        }
    };
    ConnectionManager.prototype.closeConnection = function (client) {
        if (client == "1") {
            this.RTCPeerConnectionObject_client_1.close();
            this.RTCPeerConnection_client_1 = null;
        }
        else if (client == "2") {
            this.RTCPeerConnectionObject_client_2.close();
            this.RTCPeerConnection_client_2 = null;
        }
        this.checkLivemodeStatuses(this.liveModeStatus_client_1, this.liveModeStatus_client_2);
    };
    ConnectionManager.prototype.checkLivemodeStatuses = function (status_client_1, status_client_2) {
        if (status_client_1 == false || status_client_2 == false) {
            if (typeof this.options.event_handlers.no_live_mode === 'function') {
                this.options.event_handlers.no_live_mode({});
            }
        }
    };
    //sets local description, creates offer and sends it to correct client
    ConnectionManager.prototype.createOffer = function (RTC_object, client) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, debugOffer, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        if (!(client == "1")) return [3 /*break*/, 3];
                        _a = this;
                        return [4 /*yield*/, RTC_object.createOffer()];
                    case 1:
                        _a.offer_client_1 = _b.sent();
                        debugOffer = this.offer_client_1;
                        return [4 /*yield*/, RTC_object.setLocalDescription(this.offer_client_1)];
                    case 2:
                        _b.sent();
                        if (RTC_object.signalingState == "have-local-offer") {
                            this.setRemote(this.offer_client_1, "offer", this.RTCPeerConnectionObject_client_2);
                        }
                        _b.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        error_1 = _b.sent();
                        console.log(error_1);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    //sets remote description based on type (offer or answer)
    //if type is 'answer' completes the handshake and checks if RTCPeerConnection object is connected succesfully
    ConnectionManager.prototype.setRemote = function (sessionDesc, type, RTC_object) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, error_2, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(type == "offer")) return [3 /*break*/, 7];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, RTC_object.setRemoteDescription(sessionDesc)];
                    case 2:
                        _b.sent();
                        _a = this;
                        return [4 /*yield*/, RTC_object.createAnswer()];
                    case 3:
                        _a.answer_client_2 = _b.sent();
                        return [4 /*yield*/, RTC_object.setLocalDescription(this.answer_client_2)];
                    case 4:
                        _b.sent();
                        //todo: move remote and local handling to connection class
                        if (RTC_object.signalingState == "stable") {
                            this.setRemote(this.answer_client_2, "answer", this.RTCPeerConnectionObject_client_1);
                        }
                        return [3 /*break*/, 6];
                    case 5:
                        error_2 = _b.sent();
                        console.log(error_2);
                        return [3 /*break*/, 6];
                    case 6: return [3 /*break*/, 11];
                    case 7:
                        if (!(type == "answer")) return [3 /*break*/, 11];
                        _b.label = 8;
                    case 8:
                        _b.trys.push([8, 10, , 11]);
                        return [4 /*yield*/, RTC_object.setRemoteDescription(sessionDesc)];
                    case 9:
                        _b.sent();
                        return [3 /*break*/, 11];
                    case 10:
                        error_3 = _b.sent();
                        console.log(error_3);
                        return [3 /*break*/, 11];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    return ConnectionManager;
}());
var Connection = /** @class */ (function () {
    function Connection(client, options) {
        this.client = {
            id: client,
            object: new RTCPeerConnection()
        };
    }
    return Connection;
}());
var RTCShareManager = /** @class */ (function () {
    function RTCShareManager(options) {
        var _this = this;
        this.liveModeStatus_client_1 = false;
        this.liveModeStatus_client_2 = false;
        this.audioStatus = false;
        this.options = options;
        this.conMan = new ConnectionManager(options);
        this.conMan.stopLiveMode = function (args) {
            _this.stopLiveMode(null, args.restart);
        };
        this.conMan.onReceiveAudio = function (args) {
            _this.audioSharing.receiveMedia(args.event);
        };
    }
    RTCShareManager.prototype.audioMode = function () {
        if (typeof this.options.event_handlers.on_audio_mode === 'function') {
            this.options.event_handlers.on_audio_mode({
                audioMode: !this.audioStatus
            });
        }
        if (!this.audioStatus) {
            this.audioStatus = true;
            console.log("Audiomode is on");
            this.audioSharing = new AudioSharing(this.conMan.RTCPeerConnectionObject_client_1, this.conMan.RTCPeerConnectionObject_client_2, this.options);
        }
        else {
            this.audioStatus = false;
            console.log("Audiomode is off");
            this.audioSharing.stopMediaSharing();
        }
    };
    RTCShareManager.prototype.liveMode = function () {
        if (typeof this.options.event_handlers.on_live_mode === 'function') {
            this.options.event_handlers.on_live_mode({
                isLive: !this.liveModeStatus_client_1
            });
        }
        if (!this.liveModeStatus_client_1) {
            this.liveModeStatus_client_1 = true;
            this.liveModeStatus_client_2 = true;
            this.conMan.startConnection(this.liveModeStatus_client_1, "1");
            this.conMan.startConnection(this.liveModeStatus_client_2, "2");
        }
        else {
            this.stopLiveMode("1");
            this.stopLiveMode("2");
        }
    };
    RTCShareManager.prototype.stopLiveMode = function (client, restart) {
        if (client == "1") {
            this.liveModeStatus_client_1 = false;
            this.conMan.liveModeStatus_client_1 = false;
            if (this.conMan.RTCPeerConnection_client_1) {
                this.conMan.closeConnection("1");
                this.conMan.RTCPeerConnection_client_1 = undefined;
            }
            return;
        }
        else if (client == "2") {
            //this.aShare.close("2");
            this.liveModeStatus_client_2 = false;
            this.conMan.liveModeStatus_client_2 = false;
            if (this.conMan.RTCPeerConnection_client_2) {
                this.conMan.closeConnection("2");
                this.conMan.RTCPeerConnection_client_2 = undefined;
            }
            return;
        }
        else if (restart !== undefined) {
            this.liveModeStatus_client_1 = false;
            this.liveModeStatus_client_2 = false;
            this.conMan.RTCPeerConnection_client_1 = null;
            this.conMan.RTCPeerConnection_client_2 = null;
            this.conMan.RTCPeerConnectionObject_client_1 = null;
            this.conMan.RTCPeerConnectionObject_client_2 = null;
            this.conMan.datachannel = null;
            this.liveModeStatus_client_1 = true;
            this.liveModeStatus_client_2 = true;
            this.conMan.startConnection(this.liveModeStatus_client_1, "1");
            this.conMan.startConnection(this.liveModeStatus_client_2, "2");
        }
    };
    return RTCShareManager;
}());
var AudioSharing = /** @class */ (function () {
    function AudioSharing(client1, client2, options) {
        this.audioConstraints = {
            audio: true
        };
        this.options = options;
        this.RTC_object_1 = client1;
        this.RTC_object_2 = client2;
        this.getMedia();
    }
    //asks access to user microphone and adds audiotracks to correct RTCPeerConnection
    AudioSharing.prototype.getMedia = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                navigator.mediaDevices.getUserMedia(this.audioConstraints).then(function (stream) {
                    _this.mediaDevice = stream;
                    _this.audioTracks = _this.mediaDevice.getAudioTracks();
                    console.log("Using Audio device: " + _this.audioTracks[0].label);
                    if (typeof _this.options.event_handlers.on_audio_share === 'function') {
                        _this.options.event_handlers.on_audio_share({});
                    }
                    _this.attachTrackToConnection();
                });
                return [2 /*return*/];
            });
        });
    };
    AudioSharing.prototype.attachTrackToConnection = function () {
        for (var _i = 0, _a = this.audioTracks; _i < _a.length; _i++) {
            var track = _a[_i];
            this.RTC_object_1.addTrack(track);
        }
    };
    // connections: Connection[]
    AudioSharing.prototype.stopMediaSharing = function () {
        var tracks = this.mediaDevice.getAudioTracks();
        tracks.forEach(function (track) {
            track.stop();
        });
    };
    AudioSharing.prototype.receiveMedia = function (event) {
        var inboundStream = null;
        var audioPlayer = document.createElement("AUDIO");
        audioPlayer.setAttribute("autoplay", "");
        var audioContainer = document.getElementById("audioPlayerContainer").appendChild(audioPlayer);
        if (!inboundStream) {
            inboundStream = new MediaStream();
            audioPlayer.srcObject = inboundStream;
        }
        inboundStream.addTrack(event.track);
    };
    return AudioSharing;
}());
