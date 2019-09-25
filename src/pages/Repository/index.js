import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {WebView} from 'react-native-webview';

// import { Container } from './styles';

export default class Repository extends Component {
  static navigationOptions = ({navigation}) => ({
    title: navigation.getParam('repo').name,
  });

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
    }).isRequired,
  };

  render() {
    const {navigation} = this.props;
    const {htmlUrl} = navigation.getParam('repo');
    return <WebView source={{uri: htmlUrl}} />;
  }
}
