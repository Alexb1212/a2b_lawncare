import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import API, { setToken } from '../services/api';

export default function JobTimerScreen({ route }) {
  const { jobId, token } = route.params;
  const [running, setRunning] = useState(false);

  if (token) setToken(token);

  async function start() {
    await API.post(`/jobs/${jobId}/start`);
    setRunning(true);
  }
  async function stop() {
    await API.post(`/jobs/${jobId}/stop`);
    setRunning(false);
  }

  return (
    <View style={{ padding: 20 }}>
      <Text>Job ID: {jobId}</Text>
      <Button title={running ? 'Stop Job' : 'Start Job'} onPress={running ? stop : start} />
    </View>
  );
}