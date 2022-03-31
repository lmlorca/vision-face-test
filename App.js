import * as React from 'react';
import {View, Text} from 'react-native';
import {useCameraDevices, useFrameProcessor} from 'react-native-vision-camera';
import {runOnJS} from 'react-native-reanimated';
import {Camera} from 'react-native-vision-camera';
import {scanFaces} from 'vision-camera-face-detector';

export default function App() {
  const [hasPermission, setHasPermission] = React.useState(false);
  const [faces, setFaces] = React.useState();

  const camera = React.useRef();

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

    // console.log(scannedFaces[0].yawAngle);
    if (scannedFaces[0].smilingProbability > 0.5) {
      runOnJS(setSmile)(true);
    }

    if (scannedFaces[0].yawAngle > 30) {
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
          alert('photo taken');
        })
        .catch(e => {
          alert(e);
        });
    }
  }, [smile, lookLeft]);

  return device != null && hasPermission ? (
    <View>
      <Camera
        // style={StyleSheet.absoluteFill}
        ref={camera}
        style={{width: 400, height: 400}}
        photo={true}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
        frameProcessorFps={30}
      />
      {smile && (
        <Text style={{fontSize: 20, fontWeight: 'bold', textAlign: 'center'}}>
          smilling!
        </Text>
      )}
      {lookLeft && (
        <Text style={{fontSize: 20, fontWeight: 'bold', textAlign: 'center'}}>
          look left!
        </Text>
      )}
    </View>
  ) : null;
}
