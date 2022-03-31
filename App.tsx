import * as React from 'react';
import {View, Text, StyleSheet, SafeAreaView, Alert} from 'react-native';
import {useCameraDevices, useFrameProcessor} from 'react-native-vision-camera';
import {runOnJS} from 'react-native-reanimated';
import {Camera} from 'react-native-vision-camera';
import {scanFaces} from 'vision-camera-face-detector';

export default function App() {
  const [hasPermission, setHasPermission] = React.useState(false);
  const [faceDetected, setFaceDetected] = React.useState(false);

  const camera = React.useRef<Camera>(null);

  const devices = useCameraDevices();
  const device = devices.front;

  React.useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'authorized');
    })();
  }, []);

  const [smile, setSmile] = React.useState(false);
  const [lookLeft, setLookLeft] = React.useState(false);

  const frameProcessor = useFrameProcessor(frame => {
    'worklet';
    const scannedFaces = scanFaces(frame);

    console.log(scannedFaces?.length);

    if (!scannedFaces?.[0]) {
      runOnJS(setFaceDetected)(false);
    } else {
      runOnJS(setFaceDetected)(true);
    }

    // console.log(scannedFaces[0].yawAngle);
    if (scannedFaces[0]?.smilingProbability > 0.9) {
      runOnJS(setSmile)(true);
    }

    if (scannedFaces[0]?.yawAngle > 30) {
      runOnJS(setLookLeft)(true);
    }
  }, []);

  React.useEffect(() => {
    if (smile && lookLeft) {
      camera?.current
        ?.takePhoto({
          // flash: 'on',
        })
        .then(() => {
          Alert.alert('photo taken');
        })
        .catch(e => {
          Alert.alert(e);
        });
    }
  }, [smile, lookLeft]);

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
        frameProcessorFps={30}
      />
      {!faceDetected && (
        <Text style={{color: 'white'}}>Face not detected...</Text>
      )}
      {smile && (
        <Text
          style={{
            fontSize: 20,
            fontWeight: 'bold',
            textAlign: 'center',
            color: 'white',
          }}>
          smilling!
        </Text>
      )}
      {lookLeft && (
        <Text
          style={{
            fontSize: 20,
            fontWeight: 'bold',
            textAlign: 'center',
            color: 'white',
          }}>
          look left!
        </Text>
      )}
    </SafeAreaView>
  ) : null;
}
