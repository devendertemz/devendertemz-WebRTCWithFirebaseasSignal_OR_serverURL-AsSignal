// import { mediaDevices } from 'react-native-webrtc';

// export default class Utils {
//   static async getStream() {
//     let isFront = true;
//     try {
//       // Enumerate all media devices (input/output)
//       const sourceInfos = await mediaDevices.enumerateDevices();
//       console.log('sourceInfos ' + JSON.stringify(sourceInfos));

//       let videoSourceId;
//       // Loop over sourceInfos to find the appropriate video device
//       for (let i = 0; i < sourceInfos.length; i++) {
//         const sourceInfo = sourceInfos[i];
//         if (
//           sourceInfo.kind === 'videoinput' &&
//           sourceInfo.facing === (isFront ? 'user' : 'environment')
//         ) {
//           videoSourceId = sourceInfo.deviceId;
//           break; // Found the matching video source, break the loop
//         }
//       }

//       if (!videoSourceId) {
//         console.warn('No suitable video source found');
//         return null; // Return null if no video source is found
//       }

//       // Get the user media stream
//       const stream = await mediaDevices.getUserMedia({
//         audio: true,
//         video: {
//           width: 640,
//           height: 480,
//           frameRate: 30,
//           facingMode: isFront ? 'user' : 'environment',
//           deviceId: videoSourceId,
//         },
//       });

//       // Check if the stream is valid
//       if (stream && typeof stream !== 'boolean') {
//         return stream; // Return the stream if valid
//       } else {
//         return null; // Return null if an invalid stream is returned
//       }
//     } catch (error) {
//       console.error('Error accessing media devices:', error);
//       return null; // Return null if an error occurs
//     }
//   }
// }




import {mediaDevices} from 'react-native-webrtc';

export default class Utils {
  static async getStream() {
    let isFront = true;
    const sourceInfos = await mediaDevices.enumerateDevices();
    console.log('sourceInfos ' + JSON.stringify(sourceInfos));
    let videoSourceId;
    for (let i = 0; i < sourceInfos.length; i++) {
      const sourceInfo = sourceInfos[i];
      if (
        sourceInfo.kind == 'videoinput' &&
        sourceInfo.facing == (isFront ? 'front' : 'enviroment')
      ) {
        videoSourceId = sourceInfo.deviceId;
      }
    }
    const stream = await mediaDevices.getUserMedia({
      audio: true,
      video: {
        width: 640,
        height: 480,
        frameRate: 30,
        facing: isFront ? 'user' : 'enviroment',
        deviceId: videoSourceId,
      },
    });
    if (typeof stream != 'boolean') return stream;
    return null;
  }
}
