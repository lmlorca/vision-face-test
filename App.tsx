import * as React from 'react';
import {Button, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {runOnJS} from 'react-native-reanimated';
import {
  Camera,
  useCameraDevices,
  useFrameProcessor,
} from 'react-native-vision-camera';
import {Face, scanFaces} from 'vision-camera-face-detector';
import {useFaceDetection} from './use-face-detection';

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
    if (state.success) return;
    if (face) {
      dispatch({type: 'FACE_DETECTED'});
      dispatch({type: 'DETECTION', payload: face});
    } else {
      dispatch({type: 'NO_DETECTION'});
    }
  }

  const frameProcessor = useFrameProcessor(frame => {
    'worklet';
    const scannedFaces = scanFaces(frame);
    console.log(scannedFaces[0]?.leftEyeOpenProbability);
    runOnJS(processDetection)(scannedFaces[0]);
  }, []);

  const renderInstructions = () => {
    if (state.success) {
      return (
        <View>
          <Text style={{color: 'white', marginBottom: 40}}>Success!</Text>
          <Button title="reset" onPress={() => dispatch({type: 'RESET'})} />
        </View>
      );
    }

    return (
      <Text style={{color: 'white'}}>
        {state.faceDetected ? state.detection : 'Face not detected...'}
      </Text>
    );
  };

  return device != null && hasPermission ? (
    <SafeAreaView style={StyleSheet.absoluteFill}>
      <Camera
        ref={camera}
        // style={StyleSheet.absoluteFill}
        style={{width: 300, height: 300}}
        photo={true}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
        frameProcessorFps={5}
      />
      <Text>State:</Text>
      <Text style={{fontWeight: 'bold', marginBottom: 20}}>
        {' '}
        {JSON.stringify(state, null, 2)}
      </Text>
      {renderInstructions()}
    </SafeAreaView>
  ) : null;
}
