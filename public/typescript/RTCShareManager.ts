class ConnectionManager {
  private options: any;

  public liveModeStatus_client_1: boolean;
  public RTCPeerConnection_client_1: any;
  public RTCPeerConnectionObject_client_1: RTCPeerConnection;
  private offer_client_1: RTCSessionDescriptionInit;
  public liveModeStatus_client_2: boolean;
  public RTCPeerConnection_client_2: any;
  public datachannel: RTCDataChannel;
  public RTCPeerConnectionObject_client_2: RTCPeerConnection;
  private answer_client_2: RTCSessionDescriptionInit;
  public stopLiveMode: Function;
  public onReceiveAudio: Function;
  
  //creates reference for UI element handling
  constructor(options: any) {
    this.options = options;
  }
  
  //initializes RTCPeerConnection objects and sets appropriate eveten handlers for each client
  public startConnection(liveModeStatus: boolean, client: string) {
    if (client == "1") {
      this.liveModeStatus_client_1 = liveModeStatus;
      if (!this.RTCPeerConnection_client_1) {
        this.RTCPeerConnection_client_1 = new Connection("1", this.options);
        this.RTCPeerConnectionObject_client_1 = this.RTCPeerConnection_client_1.client.object;
        this.datachannel = this.RTCPeerConnectionObject_client_1.createDataChannel("channel1");
        this.setEventHandlers("1");
      }
    } else if (client == "2") {
      this.liveModeStatus_client_2 = liveModeStatus;
      if (!this.RTCPeerConnection_client_2) {
        this.RTCPeerConnection_client_2 = new Connection("2", this.options);
        this.RTCPeerConnectionObject_client_2 = this.RTCPeerConnection_client_2.client.object;
        this.setEventHandlers("2");
      }
    }
    return;
  }

  private setEventHandlers(client) {
    if (client == "1") {
      this.RTCPeerConnectionObject_client_1.onicecandidate = (event) => {
        if (event.candidate) {
          try {
            this.RTCPeerConnectionObject_client_2.addIceCandidate(event.candidate);
          } catch (error) {
            console.log(error);
            return;
          }
        } else {
          console.log("all candidates sent by client 1");
          if (this.RTCPeerConnectionObject_client_1.iceConnectionState === "new" && this.RTCPeerConnectionObject_client_2.iceConnectionState === "new") {
            this.stopLiveMode({
              restart: true
            });
          }
        }
      };
    
      //when negotiation is needed starts connection handshake procedure
      this.RTCPeerConnectionObject_client_1.onnegotiationneeded = () => {
        if (this.liveModeStatus_client_1 && this.liveModeStatus_client_2) {
          this.createOffer(this.RTCPeerConnectionObject_client_1, "1");
        }
      }

      //listens RTCPeerConnection objects for connection state changes and makes appropriate actions
      this.RTCPeerConnectionObject_client_1.addEventListener("iceconnectionstatechange", ev => {
        if (this.RTCPeerConnectionObject_client_1) {
          if (this.RTCPeerConnectionObject_client_1.iceConnectionState === "disconnected") {
            this.RTCPeerConnectionObject_client_1.close();
            this.RTCPeerConnectionObject_client_1 = null;
          }
          if (this.RTCPeerConnectionObject_client_1.iceConnectionState === "connected") {
            console.log("client 1 connected")
          }
          if (this.RTCPeerConnectionObject_client_1.iceConnectionState === "closed") {
            return;
          }
        }
      }, false);
      
      //listens datachannel for various events and takes appropriate action
      this.datachannel.onopen = (event) => {
        this.handleDataChannelOpen(event, "1");
      }
      this.datachannel.onerror = this.handleDataChannelError;
      this.datachannel.onclose = (event) => {
        this.handleDataChannelClose();
      }
    } else if (client == "2") {
      this.RTCPeerConnectionObject_client_2.addEventListener("iceconnectionstatechange", ev => {
        if (this.RTCPeerConnectionObject_client_2) {
          if (this.RTCPeerConnectionObject_client_2.iceConnectionState === "disconnected" || this.RTCPeerConnectionObject_client_2.iceConnectionState === "closed") {
            this.RTCPeerConnectionObject_client_2.close();

          }
          if (this.RTCPeerConnectionObject_client_2.iceConnectionState === "connected") {
            console.log("client 2 connected");
          }
        }
      }, false);
      
      //When IceCandidate is found adds it to the other client
      this.RTCPeerConnectionObject_client_2.onicecandidate = (event) => {
        if (event.candidate) {
          try {
            this.RTCPeerConnectionObject_client_1.addIceCandidate(event.candidate);
          } catch (error) {
            console.log(error);

          }
        } else {
          console.log("all candidates sent by client 2");
        }
      };
      
      //when track is received delivers track event information to RTCShareManager and updates UI elements
      this.RTCPeerConnectionObject_client_2.ontrack = (event) => {
        if (typeof this.options.event_handlers.on_audio_receive === 'function') {
          this.options.event_handlers.on_audio_receive({});
        }
        this.onReceiveAudio({
          event: event
        });
      }
    }
  }

  private handleDataChannelOpen(event, client) {
    if (client == "1") {
      console.log("Datachannel is open");
    }
    if (this.datachannel) {
      if (this.datachannel.readyState == "open") {
        if (typeof this.options.event_handlers.on_established_connection === 'function') {
          this.options.event_handlers.on_established_connection({});
        }
      }
    } else {
      return;
    }
  }

  private handleDataChannelError(error) {
    console.log(error);
  }

  private handleDataChannelClose() {
    console.log("datachannel closed");
    if (typeof this.options.event_handlers.on_datachannel_close === 'function') {
      this.options.event_handlers.on_datachannel_close({});
    }
  }

  public closeConnection(client: string) {
    if (client == "1") {
      this.RTCPeerConnectionObject_client_1.close();
      this.RTCPeerConnection_client_1 = null;
    } else if (client == "2") {
      this.RTCPeerConnectionObject_client_2.close();
      this.RTCPeerConnection_client_2 = null;
    }
    this.checkLivemodeStatuses(this.liveModeStatus_client_1, this.liveModeStatus_client_2);
  }
  
// handles updating UI elements when neither client is in livemode because connection objects were terminated
  private checkLivemodeStatuses(status_client_1, status_client_2) {
    if (status_client_1 == false || status_client_2 == false) {
      if (typeof this.options.event_handlers.no_live_mode === 'function') {
        this.options.event_handlers.no_live_mode({});
      }
    }
  }

  //creates SDP offer for the purpose of starting a new WebRTC connection with another client
  private async createOffer(RTC_object: RTCPeerConnection, client: string) {
    try {
      if (client == "1") {
        this.offer_client_1 = await RTC_object.createOffer();
        await RTC_object.setLocalDescription(this.offer_client_1);
        if (RTC_object.signalingState == "have-local-offer") {
          //sets another clients SDP offer to remote end of connection
          this.setRemote(this.offer_client_1, "offer", this.RTCPeerConnectionObject_client_2);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  
  private async setRemote(sessionDesc: RTCSessionDescriptionInit, type: string, RTC_object: RTCPeerConnection) {
    if (type == "offer") {
      try {
        await RTC_object.setRemoteDescription(sessionDesc);
        //creates an SDP answer to an offer received from another client
        this.answer_client_2 = await RTC_object.createAnswer();
        await RTC_object.setLocalDescription(this.answer_client_2);
        if (RTC_object.signalingState == "stable") {
          this.setRemote(this.answer_client_2, "answer", this.RTCPeerConnectionObject_client_1);
        }
      } catch (error) {
        console.log(error);
      }
    } else if (type == "answer") {
      try {
        await RTC_object.setRemoteDescription(sessionDesc);
      } catch (error) {
        console.log(error);
      }
    }
  }
}

interface IClient {
  id: string;
  object: RTCPeerConnection;
}

class Connection {
  public client: IClient;

  constructor(client: string, options: any) {
    this.client = {
      id: client,
      object: new RTCPeerConnection()
    };
  }
}

class RTCShareManager {
  private liveModeStatus_client_1: boolean = false;
  private liveModeStatus_client_2: boolean = false;
  private audioStatus: boolean = false;
  private conMan: ConnectionManager;
  private audioSharing: AudioSharing;
  private options: any;

  constructor(options: any) {
    this.options = options;
    this.conMan = new ConnectionManager(
      options
    );

    //if WebRTC connection fails, initializes restart functionality
    this.conMan.stopLiveMode = (args: any) => {
      this.stopLiveMode(null, args.restart);
    }
    
    this.conMan.onReceiveAudio = (args: any) => {
      this.audioSharing.receiveMedia(args.event);
    }
  }

  //handles audiomode functionality. updates UI elements and initializes new AudioSharing instance or stops audiotracks if audiomode is turned off
  public audioMode() {
    if (typeof this.options.event_handlers.on_audio_mode === 'function') {
      this.options.event_handlers.on_audio_mode({
        audioMode: !this.audioStatus
      });
    }
    
    if (!this.audioStatus) {
      this.audioStatus = true;
      console.log("Audiomode is on");
      this.audioSharing = new AudioSharing(this.conMan.RTCPeerConnectionObject_client_1, this.conMan.RTCPeerConnectionObject_client_2, this.options);
    } else {
      this.audioStatus = false;
      console.log("Audiomode is off");
      this.audioSharing.stopMediaSharing();
    }
  }

  //handles livemode functionality. initializes connection sequences and is responsible for ending connection if livemode is turned off 
  public liveMode() {
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
    } else {
      this.stopLiveMode("1");
      this.stopLiveMode("2");
    }
  }


  private stopLiveMode(client ? : string, restart ? : boolean) {
    if (client == "1") {
      this.liveModeStatus_client_1 = false;
      this.conMan.liveModeStatus_client_1 = false;
      if (this.conMan.RTCPeerConnection_client_1) {
        this.conMan.closeConnection("1");
        this.conMan.RTCPeerConnection_client_1 = undefined;
      }
      return;
    } else if (client == "2") {
      //this.aShare.close("2");
      this.liveModeStatus_client_2 = false;
      this.conMan.liveModeStatus_client_2 = false;
      if (this.conMan.RTCPeerConnection_client_2) {
        this.conMan.closeConnection("2");
        this.conMan.RTCPeerConnection_client_2 = undefined;
      }
      return;
    } else if (restart !== undefined) {
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
  }
}

class AudioSharing {
  private options: any;
  private mediaDevice: MediaStream;
  private audioTracks: MediaStreamTrack[];
  private RTC_object_1: RTCPeerConnection;
  private RTC_object_2: RTCPeerConnection;

  private audioConstraints: MediaStreamConstraints = {
    audio: true
  };

  constructor(client1: RTCPeerConnection, client2: RTCPeerConnection, options ? : any) {
    this.options = options;
    this.RTC_object_1 = client1;
    this.RTC_object_2 = client2;
    this.getMedia();
  }

  //get access to user microphone, add tracks to RTCPeerConnection object and update UI elements
  private async getMedia() {
    navigator.mediaDevices.getUserMedia(this.audioConstraints).then((stream: MediaStream) => {
      this.mediaDevice = stream;
      this.audioTracks = this.mediaDevice.getAudioTracks();
      console.log("Using Audio device: " + this.audioTracks[0].label);
      if (typeof this.options.event_handlers.on_audio_share === 'function') {
        this.options.event_handlers.on_audio_share({});
      }
      this.attachTrackToConnection();
    });
  }

  private attachTrackToConnection() {
    for (const track of this.audioTracks) {
      this.RTC_object_1.addTrack(track);
    }
  }

 
  public stopMediaSharing() {
    let tracks = this.mediaDevice.getAudioTracks();
    tracks.forEach(track => {
      track.stop();
    });
  }
  
  //create new mediastream object for received audio track and attach stream to HTML audio element
  public receiveMedia(event: MediaStreamTrackEvent) {
    let inboundStream = null;
    let audioPlayer: HTMLAudioElement = < HTMLAudioElement > document.createElement("AUDIO");
    audioPlayer.setAttribute("autoplay", "");
    let audioContainer = document.getElementById("audioPlayerContainer").appendChild(audioPlayer);
    if (!inboundStream) {
      inboundStream = new MediaStream();
      audioPlayer.srcObject = inboundStream;
    }
    inboundStream.addTrack(event.track);
  }
}
