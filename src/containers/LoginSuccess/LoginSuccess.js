import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import axios from 'axios';
import queryString from 'query-string';
import * as actionTypes from '../../store/actions';
import * as db from '../../db';
import config from '../../config';

class LoginSuccess extends Component {
  async componentDidMount() {
    const {
      updateAppState, 
      updateUserCollection,
      history,
      location
    } = this.props;

    const values = queryString.parse(location.search);

    const incomingUserData = {};
    const { 
      access_token: battleNetToken,
      id: userId,
      battletag: battleTag,
     } = values;
    
    incomingUserData.battleNetToken = battleNetToken;
    incomingUserData.userId = userId;
    incomingUserData.battleTag = decodeURIComponent(battleTag);
    
    try {
      const blizzCharUrl = 'https://us.api.blizzard.com/wow/user/characters';
      const characterResult = await axios({ 
        url: blizzCharUrl,
        params: { access_token: battleNetToken }
      });

      updateAppState('userCharacterData', characterResult.data.characters);

      incomingUserData.characterData = characterResult.data.characters;
    } catch (err) {
      console.log('--> bnet request err :', err);
    }

    axios.defaults.headers.common.id = userId;
    axios.defaults.headers.common.authorization = `Bearer ${battleNetToken}`;

    try {
      const userResult = await axios({ url: `${config.SITE_BACKEND}/user/${userId}` });
      if (userResult.data) {
        incomingUserData.collected = userResult.data.collected;
        incomingUserData.role = userResult.data.role;
      }
      
      updateAppState('userData', incomingUserData);
      db.putData('userData', incomingUserData);
      updateUserCollection(incomingUserData.collected);
  
      if (incomingUserData.collected) {
        history.push('/');
      } else {
        history.push('/user'); // new users prompt to add collection data
      }
    } catch (err) {
      console.log('--> user data request err :', err);
      history.push('/');
    }
  }

  render() {
    return (
      <div>
        <h1>Battlenet Login Successful</h1>
        <p>Retrieving account info...</p>
      </div>
    );
  }
}

LoginSuccess.propTypes = {
  history: PropTypes.object.isRequired,
  updateAppState: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
  updateUserCollection: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({ userData: state.userData, });

const mapDispatchToProps = (dispatch) => ({ 
  updateUserCollection: (collected) => dispatch({
    type: actionTypes.ADD_USER_DATA,
    data: collected
  }),
  updateAppState: (key, value) => dispatch({ 
    type: actionTypes.ADD_STATE, 
    data: { key, value } 
  }),
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(LoginSuccess));
