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
    bounds: {
      height: 0,
      width: 0,
      x: 0,
      y: 0,
    } as {
      y: number;
      x: number;
      height: number;
      width: number;
    },
    tooClose: false,
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
        type: 'BOUNDS';
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
      case 'BOUNDS':
        if (
          action.payload.bounds.width > 300 ||
          action.payload.bounds.height > 300
        ) {
          return {
            ...state,
            tooClose: true,
          };
        }
        if (
          action.payload.bounds.y > 350 ||
          action.payload.bounds.y < 80 ||
          action.payload.bounds.x < 80 ||
          action.payload.bounds.x > 160
        ) {
          return {
            ...state,
            faceDetected: false,
          };
        }
        return {
          ...state,
          tooClose: false,
          faceDetected: true,
          bounds: action.payload.bounds,
        };

      case 'DETECTION':
        if (state.success || state.tooClose) {
          return state;
        }

        if (state.detection === 'SMILE') {
          if (action.payload.smilingProbability > 0.7) {
            return {
              ...state,
              detection: 'BLINK' as Detection,
            };
          }
        }

        if (state.detection === 'BLINK') {
          if (
            action.payload.leftEyeOpenProbability < 0.07 &&
            action.payload.rightEyeOpenProbability < 0.07
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
          if (action.payload.pitchAngle < -5) {
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
          bounds: initialState.bounds,
          tooClose: false,
          outOfBounds: false,
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
