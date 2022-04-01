import * as React from 'react';
import {
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from 'react-native';
import {AnimatedCircularProgress} from 'react-native-circular-progress';
import {runOnJS} from 'react-native-reanimated';
import Svg, {Path, SvgProps} from 'react-native-svg';
import {
  Camera,
  useCameraDevices,
  useFrameProcessor,
} from 'react-native-vision-camera';
import {Face, scanFaces} from 'vision-camera-face-detector';
import {useFaceDetection} from './use-face-detection';

const {width, height} = Dimensions.get('window');

export default function App() {
  const [hasPermission, setHasPermission] = React.useState(false);

  const camera = React.useRef<Camera>(null);

  const devices = useCameraDevices();
  const device = devices.front;

  const [state, dispatch] = useFaceDetection();

  React.useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'authorized');
    })();
  }, []);

  function processDetection(face?: Face) {
    // if (state.success || state.outOfBounds || state.tooClose) return;
    if (face) {
      dispatch({type: 'FACE_DETECTED'});
      dispatch({type: 'BOUNDS', payload: face});
      dispatch({type: 'DETECTION', payload: face});
    } else {
      dispatch({type: 'NO_DETECTION'});
    }
  }

  const frameProcessor = useFrameProcessor(frame => {
    'worklet';
    const scannedFaces = scanFaces(frame);
    runOnJS(processDetection)(scannedFaces?.[0]);
  }, []);

  const renderInstructions = () => {
    if (state.success) {
      return (
        <View>
          <Text style={{color: 'black', marginBottom: 40}}>Success!</Text>
          <Button title="reset" onPress={() => dispatch({type: 'RESET'})} />
        </View>
      );
    }

    if (state.tooClose) {
      return <Text style={{color: 'red'}}>Too Close</Text>;
    }

    return (
      <Text style={{color: 'black'}}>
        {state.faceDetected ? state.detection : 'Face not detected...'}
      </Text>
    );
  };

  const getCircleColor = () => {
    if (state.success) return '#14b814';
    if (state.tooClose || !state.faceDetected) return '#d12929';
    return '#06b8ff';
  };

  return device != null && hasPermission ? (
    <SafeAreaView
      style={{
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'white',
        position: 'relative',
      }}>
      <View
        style={{
          marginTop: 40,
          marginBottom: 40,
          borderColor: 'white',
          borderWidth: 2,
        }}>
        <Camera
          ref={camera}
          style={{width: 300, height: 300}}
          photo={true}
          device={device}
          isActive={true}
          frameProcessor={frameProcessor}
          frameProcessorFps={2}
        />
        <CameraPreviewMask style={{position: 'absolute'}} />
        <AnimatedCircularProgress
          style={{
            width: 300,
            height: 300,
            position: 'absolute',
          }}
          size={300}
          width={10}
          backgroundWidth={7}
          fill={state.progress}
          tintColor={getCircleColor()}
          backgroundColor={
            state.tooClose || !state.faceDetected ? '#d12929' : 'white'
          }
        />
      </View>
      {renderInstructions()}
    </SafeAreaView>
  ) : null;
}

const CameraPreviewMask = (props: SvgProps) => (
  <Svg width={300} height={300} viewBox="0 0 300 300" fill="none" {...props}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M150 0H0v300h300V0H150zm0 0c82.843 0 150 67.157 150 150s-67.157 150-150 150S0 232.843 0 150 67.157 0 150 0z"
      fill="#fff"
    />
  </Svg>
);

const styles = StyleSheet.create({
  actionPrompt: {
    fontSize: 20,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // promptContainer: {
  //   position: 'absolute',
  //   alignSelf: 'center',
  //   top: PREVIEW_MARGIN_TOP + PREVIEW_SIZE,
  //   height: '100%',
  //   width: '100%',
  //   backgroundColor: 'white',
  // },
  faceStatus: {
    fontSize: 24,
    textAlign: 'center',
    marginTop: 10,
  },
  cameraPreview: {
    flex: 1,
  },
  // circularProgress: {
  //   position: 'absolute',
  //   width: PREVIEW_SIZE,
  //   height: PREVIEW_SIZE,
  //   top: PREVIEW_MARGIN_TOP,
  //   alignSelf: 'center',
  // },
  action: {
    fontSize: 24,
    textAlign: 'center',
    marginTop: 10,
    fontWeight: 'bold',
  },
});
