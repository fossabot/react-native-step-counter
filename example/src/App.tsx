import React from 'react';
import { Button, Platform, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import type { TextProps } from 'react-native';
import {
  isSensorWorking,
  isStepCountingSupported,
  parseStepData,
  startStepCounterUpdate,
  stopStepCounterUpdate,
  type ParsedStepCountData,
} from '@dongminyu/react-native-step-counter';
import { getBodySensorPermission, getStepCounterPermission } from './permission';
import LogCat from './LogCat';

type SensorType<T = typeof Platform.OS> = T extends 'ios'
  ? 'CMPedometer'
  : T extends 'android'
  ? 'Step Counter' | 'Accelerometer'
  : 'NONE';

type SensorName = SensorType<Platform['OS']>;

const initState = {
  dailyGoal: '0/10000 steps',
  stepsString: '0.0kCal',
  calories: '0 steps',
  distance: '0.0m',
};

type AdditionalInfo = Partial<ParsedStepCountData>;

export default function App() {
  const [loaded, setLoaded] = React.useState(false);
  const [supported, setSupported] = React.useState(false);
  const [granted, setGranted] = React.useState(false);
  const [sensorType, setSensorType] = React.useState<SensorName>('NONE');
  const [additionalInfo, setAdditionalInfo] = React.useState<AdditionalInfo>(initState);

  /** get user's motion permission and check pedometer is available */
  const isPedometerSupported = () => {
    isStepCountingSupported().then((result) => {
      setGranted(result.granted === true);
      setSupported(result.supported === true);
    });
  };

  const startStepCounter = () => {
    startStepCounterUpdate(new Date(), (data) => {
      setSensorType(data.counterType as SensorName);
      const parsedData = parseStepData(data);
      setAdditionalInfo({
        ...parsedData,
      });
    });
    setLoaded(true);
  };

  const stopStepCounter = () => {
    setAdditionalInfo(initState);
    stopStepCounterUpdate();
    setLoaded(false);
  };

  const forceUseAnotherSensor = () => {
    if (isSensorWorking) {
      stopStepCounter();
    } else {
      if (sensorType === 'Step Counter') {
        getBodySensorPermission().then(setGranted);
      } else {
        getStepCounterPermission().then(setGranted);
      }
    }
    startStepCounter();
  };

  React.useEffect(() => {
    isPedometerSupported();
    return () => {
      stopStepCounter();
    };
  }, []);

  React.useEffect(() => {
    console.debug(`🚀 stepCounter ${supported ? '' : 'not'} supported`);
    console.debug(`🚀 user ${granted ? 'granted' : 'denied'} stepCounter`);
    startStepCounter();
  }, [granted, supported]);

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <NormalText>User Granted the Permission?: {granted ? 'yes' : 'no'}</NormalText>
        <NormalText>Device has Pedometer Sensor?: {supported ? 'yes' : 'no'}</NormalText>
        <NormalText>now Using : {sensorType}</NormalText>
        <NormalText>dailyGoal : {additionalInfo.dailyGoal}</NormalText>
        <NormalText>calories : {additionalInfo.calories}</NormalText>
        <NormalText>stepsString : {additionalInfo.stepsString}</NormalText>
        <NormalText>distance : {additionalInfo.distance}</NormalText>
        <View style={styles.bGroup}>
          <Button title="Start stepping" onPress={startStepCounter} />
          <Button title="restart" onPress={forceUseAnotherSensor} />
          <Button title="Stop stepping" onPress={stopStepCounter} />
        </View>
        <LogCat trigger={loaded} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    display: 'flex',
  },
  normal: {
    fontSize: 20,
    color: 'slategrey',
  },
  bGroup: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    display: 'flex',
    marginVertical: 8,
  },
});

/* A way to create a component with default props. */
const NormalText = (props: TextProps) => <Text style={styles.normal} {...props} />;
