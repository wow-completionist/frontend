/* eslint-disable react/forbid-prop-types */
import React, { Component } from 'react';
import { Route, NavLink, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import axios from 'axios';
import * as actionTypes from '../store/actions';
import * as db from '../db';
import User from './User/User';
import Main from './Main/Main';
import CreateSets from './CreateSets/CreateSets';
import EditSets from './EditSets/EditSets';
import EditVisual from './EditVisual/EditVisual';
import Scraper from './Scraper/Scraper';
// import Login from './Login/Login';
import LoginSuccess from './LoginSuccess/LoginSuccess';
import config from '../config';

import './Navigator.css';

class Navigator extends Component {
  async componentDidMount() {
    const {
      transmogSetList,
      loadSetData,
      updateVisualMetaData,
      sourceList,
      addSourceData,
      updateAppState,
      visualMetaHash,
    } = this.props;

    // Since the Navigator is the primary container window, we must load the initial state here

    // user Data
    const userDataQuery = await db.getData('userData');
    if (userDataQuery) {
      axios.defaults.headers.common.id = userDataQuery.data.userId;
      updateAppState('userData', userDataQuery.data);
    }

    // Set Data - load cache then update from db
    if (!transmogSetList || transmogSetList.length === 0) {
      let result = await db.getData('sets');
      if (result) {
        console.log('-- set list loaded from memory --');
        loadSetData(result.data);
      }

      try {
        result = await axios.get(`${config.SITE_BACKEND}/sets`);
        db.putData('sets', result.data);
        console.log('-- Axios: set list updated --');
        loadSetData(result.data);
      } catch (err) {
        console.log(`Error fetching set list: ${err}`);
      }
    }

    // Visual Metas - load cache then update from db
    let visualsList;
    if (!visualMetaHash || Object.keys(visualMetaHash).length === 0) {
      let result = await db.getData('visuals');
      if (result) {
        console.log('-- DB: visuals loaded --');
        updateVisualMetaData(result.data);
        visualsList = result.data;
        console.log('--> visualsList :', visualsList);
      }

      try {
        result = await axios.get(`${config.SITE_BACKEND}/visuals`);
        console.log('-- Axios: visuals updated --');
        db.putData('visuals', result.data);
        updateVisualMetaData(result.data);
        visualsList = result.data;
        console.log('--> visualsList :', visualsList);
      } catch (err) {
        console.log(`Error fetching visual meta data: ${err}`);
      }
    }
    
    // Full source list
    if (!sourceList || Object.keys(sourceList).length === 0) {
      let result = await db.getData('sourceList');
      if (result && result.data) {
        console.log('-- DB: sources loaded --');
        addSourceData(result.data);
      }
      
      try {
        result = await axios.get(`${config.SITE_BACKEND}/sources`);
        console.log('-- Axios: sources updated --');
        if (result && result.data) {
          db.putData('sourceList', result.data);
          addSourceData(result.data);
        }
      } catch (err) {
        console.log(`Error fetching full item list: ${err}`);
      }
    }
  }
  
  // toggleModal = () => {
  //   const { showLogin } = this.state;
  //   this.setState({ showLogin: !showLogin });
  // }

  render() {
    // const { showLogin } = this.state;
    const { userData } = this.props;

    let loginComponent = (
      <li>
        <NavLink
          to="/login"
          exact
          activeClassName="battle-net-login-button"
        >
          Login using Battle.Net
        </NavLink>
      </li>
    );

    if (userData && userData.battleTag) {
      loginComponent = (
        <li>
          <NavLink
            to="/user"
            exact
            className="logged-in-button"
          >
            {`Logged in as ${userData.battleTag}`}
          </NavLink>
        </li>
      );
    }

    const adminOnly = (userData.role === 'admin') ? {} : { display: 'none' };
    const writeOnly = (userData.role === 'admin' || userData.role === 'write') ? {} : { display: 'none' };
    return (
      <div className="Navigator">
        <header>
          <nav>
            <ul>
              <li>
                <NavLink
                  to="/"
                  exact
                  activeClassName="my-active-link"
                >
                  Main
                </NavLink>
              </li>
              <li style={writeOnly}>
                <NavLink
                  to="/set/new"
                  exact
                  activeClassName="my-active-link"
                >
                  Create Sets
                </NavLink>
              </li>
              <li style={adminOnly}>
                <NavLink
                  to="/scraper"
                  exact
                  activeClassName="my-active-link"
                >
                  Scraper
                </NavLink>
              </li>

              {loginComponent}
              

              {/* <li>
                <button 
                  type="button"
                  className="btn btn-primary short"
                  onClick={this.toggleModal}
                >
                  Login
                </button>
              </li> */}
            </ul>
          </nav>
        </header>
        <Switch>
          {/* Optional; specify only one Route match; used when path names are too similar */}
          <Route exact path="/" component={Main} />
          <Route exact path="/user" component={User} />
          <Route exact path="/set/new" component={CreateSets} />
          <Route exact path="/set/edit/:setId" component={EditSets} />
          <Route exact path="/visual/edit/:visualID" component={EditVisual} />
          <Route exact path="/scraper" component={Scraper} />
          <Route
            exact
            path="/login"
            render={() => { 
              // send client browser to backend oauth page
              window.location = `${config.SITE_BACKEND}/login`; 
            }}
          />
          <Route 
            exact 
            path="/login_success" 
            render={(routeProps) => (
              <LoginSuccess 
                {...routeProps}
              />
            )}
          />
        </Switch>
        {/* <div className={`container ${showLogin ? 'modal-open' : ''}`}>
          <Login 
            toggle={this.toggleModal}
            showModal={showLogin}
          />
        </div> */}
      </div>
    );
  }
}

Navigator.propTypes = {
  transmogSetList: PropTypes.array.isRequired,
  sourceList: PropTypes.array.isRequired,
  visualMetaHash: PropTypes.object.isRequired,
  loadSetData: PropTypes.func.isRequired,
  updateVisualMetaData: PropTypes.func.isRequired,
  addSourceData: PropTypes.func.isRequired,
  userData: PropTypes.object.isRequired,
  history: PropTypes.object,
  updateAppState: PropTypes.func.isRequired,

};

Navigator.defaultProps = { history: {}, };

const mapStateToProps = (state) => ({
  sourceList: state.sourceList,
  transmogSetList: state.transmogSetList,
  visualMetaHash: state.visualMetaHash,
  userData: state.userData,
});

const mapDispatchToProps = (dispatch) => ({
  loadSetData: (setData) => dispatch({ type: actionTypes.LOAD_TRANSMOG_SETS, data: setData }),
  updateVisualMetaData: (visualMetaData) => dispatch({
    type: actionTypes.UPDATE_VISUAL_META_DATA,
    data: visualMetaData 
  }),
  addSourceData: (newData) => dispatch({ type: actionTypes.ADD_SOURCE_DATA, data: newData }),
  updateAppState: (key, value) => dispatch({ 
    type: actionTypes.ADD_STATE, 
    data: { key, value } 
  }) 
});

export default connect(mapStateToProps, mapDispatchToProps)(Navigator);
