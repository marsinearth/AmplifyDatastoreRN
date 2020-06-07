/**
 * @format
 */
import Amplify from '@aws-amplify/core';
import App from './src/App';
import {AppRegistry} from 'react-native';
import {name as appName} from './app.json';
import config from './aws-exports';

Amplify.configure(config);
AppRegistry.registerComponent(appName, () => App);
