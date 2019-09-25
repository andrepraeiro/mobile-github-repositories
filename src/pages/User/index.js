import React, {Component} from 'react';
import {StyleSheet, View, ActivityIndicator} from 'react-native';
import PropTypes from 'prop-types';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';

import api from '../../services/api';

import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Stars,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,
  EmptyList,
} from './styles';

const styles = StyleSheet.create({
  avatarOwner: {
    height: 42,
    width: 42,
    borderRadius: 21,
  },
  avatarUser: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
});

export default class User extends Component {
  static navigationOptions = ({navigation}) => ({
    title: navigation.getParam('user').name,
  });

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
      navigate: PropTypes.func,
    }).isRequired,
  };

  state = {
    stars: [],
    visible: false,
    headerIsVisible: false,
    page: 1,
    loading: false,
    thereAreMore: false,
  };

  componentDidMount() {
    const {page} = this.state;
    this.loadRepos(page);
  }

  loadRepos = async (page = 1) => {
    const {navigation} = this.props;
    const user = navigation.getParam('user');
    const {stars} = this.state;
    const response = await api.get(`/users/${user.login}/starred?page=${page}`);
    this.setState({
      stars: [...stars, ...response.data],
      page,
      visible: true,
      loading: false,
      headerIsVisible: true,
      thereAreMore: response.headers.link
        ? response.headers.link.includes('next')
        : false,
    });
  };

  loadMoreRepos = () => {
    const {page, thereAreMore} = this.state;
    if (thereAreMore) {
      this.setState({loading: true});
      this.loadRepos(page + 1);
    }
  };

  renderFooter = () => {
    const {loading} = this.state;
    if (!loading) return null;
    return (
      <View style={styles.loading}>
        <ActivityIndicator />
      </View>
    );
  };

  renderEmptyList = visible => {
    const rows = [];

    for (let index = 0; index < 5; index += 1) {
      rows.push(
        <Starred key={index}>
          <ShimmerPlaceHolder
            style={styles.avatarOwner}
            autoRun
            visible={visible}>
            <OwnerAvatar source={{}} />
          </ShimmerPlaceHolder>
          <Info>
            <ShimmerPlaceHolder autoRun visible={visible}>
              <Title>Title</Title>
            </ShimmerPlaceHolder>
            <ShimmerPlaceHolder autoRun visible={visible}>
              <Author>login</Author>
            </ShimmerPlaceHolder>
          </Info>
        </Starred>
      );
    }
    return <EmptyList>{rows}</EmptyList>;
  };

  handleRepoButton = repo => {
    console.tron.log(repo);
    const {navigation} = this.props;
    navigation.navigate('Repository', {repo});
  };

  renderItemList = item => (
    <Starred onPress={() => this.handleRepoButton({htmlUrl: item.html_url})}>
      <OwnerAvatar source={{uri: item.owner.avatar_url}} />
      <Info>
        <Title>{item.name}</Title>
        <Author>{item.owner.login}</Author>
      </Info>
    </Starred>
  );

  render() {
    const {navigation} = this.props;
    const {stars, visible, headerIsVisible} = this.state;
    const user = navigation.getParam('user');
    return (
      <Container>
        <Header>
          <ShimmerPlaceHolder
            style={styles.avatarUser}
            autoRun
            visible={headerIsVisible}>
            <Avatar source={{uri: user.avatar}} />
          </ShimmerPlaceHolder>
          <ShimmerPlaceHolder autoRun visible={headerIsVisible}>
            <Name>{user.name}</Name>
          </ShimmerPlaceHolder>
          <ShimmerPlaceHolder autoRun visible={headerIsVisible}>
            <Bio>{user.bio}</Bio>
          </ShimmerPlaceHolder>
        </Header>
        <ShimmerPlaceHolder autoRun visible={headerIsVisible}>
          <Title>Starred Repos</Title>
        </ShimmerPlaceHolder>
        {visible === true ? (
          <Stars
            data={stars}
            keyExtractor={star => String(star.id)}
            onEndReached={this.loadMoreRepos}
            onEndReachedThreshold={0.3}
            ListFooterComponent={this.renderFooter}
            renderItem={({item}) => this.renderItemList(item)}
          />
        ) : (
          this.renderEmptyList(visible)
        )}
      </Container>
    );
  }
}
