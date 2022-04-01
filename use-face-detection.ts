import {useReducer} from 'react';
import {Face} from 'vision-camera-face-detector';

export const useFaceDetection = () => {
  type Detection =
    | 'SMILE'
    | 'BLINK'
    | 'TURN_HEAD_LEFT'
    | 'TURN_HEAD_RIGHT'
    | 'NOD';

  const initialState = {
    faceDetected: false,
    detection: 'SMILE' as Detection,
    success: false,
  };
  type Action =
    | {
        type: 'FACE_DETECTED';
      }
    | {
        type: 'DETECTION';
        payload: Face;
      }
    | {
        type: 'NO_DETECTION';
      }
    | {
        type: 'RESET';
      };

  return useReducer((state: typeof initialState, action: Action) => {
    switch (action.type) {
      case 'FACE_DETECTED':
        return {
          ...state,
          faceDetected: true,
        };
      case 'DETECTION':
        if (state.detection === 'SMILE') {
          if (action.payload.smilingProbability > 0.9) {
            return {
              ...state,
              detection: 'BLINK' as Detection,
            };
          }
        }

        if (state.detection === 'BLINK') {
          if (
            action.payload.leftEyeOpenProbability < 0.04 &&
            action.payload.rightEyeOpenProbability < 0.04
          ) {
            return {
              ...state,
              detection: 'TURN_HEAD_LEFT' as Detection,
            };
          }
        }

        if (state.detection === 'TURN_HEAD_LEFT') {
          if (action.payload.yawAngle > 20) {
            return {
              ...state,
              detection: 'TURN_HEAD_RIGHT' as Detection,
            };
          }
        }

        if (state.detection === 'TURN_HEAD_RIGHT') {
          if (action.payload.yawAngle < -20) {
            return {
              ...state,
              detection: 'NOD' as Detection,
            };
          }
        }

        if (state.detection === 'TURN_HEAD_RIGHT') {
          if (action.payload.yawAngle < -20) {
            return {
              ...state,
              detection: 'NOD' as Detection,
            };
          }
        }

        if (state.detection === 'NOD') {
          if (action.payload.pitchAngle < -10) {
            return {
              ...state,
              success: true,
            };
          }
        }

        return state;

      case 'NO_DETECTION':
        return {
          ...state,
          faceDetected: false,
        };

      case 'RESET':
        return initialState;

      default:
        return state;
    }
  }, initialState);
};

// switch (state.detection) {
//   case 'SMILE':
//     if (action.payload.smilingProbability > 0.8) {
//       return {
//         faceDetected: true,
//         success: false,
//         detection: 'BLINK' as Detection,
//       };
//     } else {
//       return {
//         ...state,
//         faceDetected: true,
//       };
//     }

//   case 'BLINK':
//     if (
//       action.payload.leftEyeOpenProbability < 0.4 ||
//       action.payload.rightEyeOpenProbability < 0.4
//     ) {
//       return {
//         ...state,
//         detection: 'TURN_HEAD_LEFT' as Detection,
//       };
//     }

//   case 'TURN_HEAD_LEFT':
//     if (action.payload.yawAngle > 20) {
//       Alert.alert('aaaa');
//       return {
//         ...state,
//         detection: 'TURN_HEAD_RIGHT' as Detection,
//       };
//     }

//   case 'TURN_HEAD_RIGHT':
//     if (action.payload.yawAngle < -20) {
//       return {
//         ...state,
//         detection: 'NOD' as Detection,
//       };
//     }

//   case 'NOD':
//     if (action.payload.pitchAngle < -10) {
//       return {
//         ...state,
//         success: true,
//         detection: 'SMILE' as Detection,
//       };
//     }

//   default:
//     return state;
// }
