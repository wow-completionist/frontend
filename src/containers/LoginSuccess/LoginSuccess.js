import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import axios from 'axios';
import queryString from 'query-string';
import * as actionTypes from '../../store/actions';
import * as db from '../../db';

class LoginSuccess extends Component {
  async componentDidMount() {
    const {
      updateAppState, 
      loadUserCollection,
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
      const characterResult = await axios(`https://us.api.blizzard.com/wow/user/characters?access_token=${battleNetToken}`);

      updateAppState('userCharacterData', characterResult.data.characters);

      incomingUserData.characterData = characterResult.data.characters;
    } catch (err) {
      console.log('--> bnet request err :', err);
    }

    axios.defaults.headers.common.id = userId;

    try {
      const userResult = await axios(`http://lvh.me:4000/user/${userId}`);
      if (userResult.data) {
        incomingUserData.collected = userResult.data.collected;
        incomingUserData.role = userResult.data.role;
      }
    } catch (err) {
      console.log('--> user data request err :', err);
    }
    
    updateAppState('userData', incomingUserData);
    db.putData('userData', incomingUserData);
    loadUserCollection(incomingUserData.collected);

    if (incomingUserData.collected) {
      history.push('/');
    } else {
      history.push('/user'); // new users prompt to add collection data
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
  userData: PropTypes.object.isRequired,
  loadUserCollection: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({ userData: state.userData, });

const mapDispatchToProps = (dispatch) => ({ 
  loadUserCollection: (collected) => dispatch({
    type: actionTypes.ADD_USER_DATA,
    data: collected
  }),
  updateAppState: (key, value) => dispatch({ 
    type: actionTypes.ADD_STATE, 
    data: { key, value } 
  }),
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(LoginSuccess));
