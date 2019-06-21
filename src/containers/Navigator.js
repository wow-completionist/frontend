/* eslint-disable react/forbid-prop-types */
import React, { Component } from 'react';
import { Route, NavLink, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import axios from 'axios';
import * as actionTypes from '../store/actions';

import Main from './Main/Main';
import CreateSets from './CreateSets/CreateSets';
import EditSets from './EditSets/EditSets';
import EditVisual from './EditVisual/EditVisual';
import Scraper from './Scraper/Scraper';
import Login from './Login/Login';
// import NewPost from './NewPost/NewPost';
// import FullPost from './FullPost/FullPost';

import './Navigator.css';

class Navigator extends Component {
  state={ showLogin: false }

  async componentDidMount() {
    const {
      transmogSetList,
      loadSetData,
      loadVisualMetaData,
      fullSourceIDList,
      addScrapedData,
      loadUserData,
      visualMetaHash,
    } = this.props;

    // Since the Navigator is the main window, we must load the initial state here
    if (!transmogSetList || transmogSetList.length === 0) {
      axios.get('http://lvh.me:4000/sets')
        .then((result) => {
          loadSetData(result.data);
        })
        .catch((err) => {
          console.log(`Error fetching set list: ${err}`);
        });
    }
    if (!visualMetaHash || Object.keys(visualMetaHash).length === 0) {
      axios.get('http://lvh.me:4000/visuals')
        .then((result) => {
          loadVisualMetaData(result.data);
        })
        .catch((err) => {
          console.log(`Error fetching visual meta data: ${err}`);
        });
    }
    if (!fullSourceIDList || Object.keys(fullSourceIDList).length === 0) {
      axios.get('http://lvh.me:4000/items')
        .then((result) => {
          const formattedData = {};
          result.data.forEach((item) => {
            formattedData[item.sourceID] = item;
          });
          addScrapedData(formattedData);
        })
        .catch((err) => {
          console.log(`Error fetching full item list: ${err}`);
        });
    }
    if (!transmogSetList || transmogSetList.length === 0) {
      axios.get('http://lvh.me:4000/user/6d63d26d-5781-4f70-a16e-3da2dfad5dfd')
        .then((result) => {
          loadUserData(result.data);
        })
        .catch((err) => {
          console.log(`Error fetching userCollection list: ${err}`);
        });
    }
  }
  
  toggleModal = () => {
    const { showLogin } = this.state;
    this.setState({ showLogin: !showLogin });
  }

  render() {
    const { showLogin } = this.state;
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
              <li>
                <NavLink
                  to="/set/new"
                  exact
                  activeClassName="my-active-link"
                >
                  Create Sets
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/scraper"
                  exact
                  activeClassName="my-active-link"
                >
                  Scraper
                </NavLink>
              </li>
              <li>
                <button 
                  type="button"
                  className="btn btn-primary short"
                  onClick={this.toggleModal}
                >
                  Login
                </button>
              </li>
            </ul>
          </nav>
        </header>
        <Switch>
          {' '}
          {/* Optional; specify only one Route match; used when path names are too similar */}
          <Route path="/" exact component={Main} />
          <Route path="/set/new" exact component={CreateSets} />
          <Route path="/set/edit/:setId" exact component={EditSets} />
          <Route path="/visual/edit/:visualId" exact component={EditVisual} />
          <Route path="/scraper" exact component={Scraper} />
          {/* <Route path="/post/:id" exact component={FullPost} /> */}
        </Switch>
        <div className={`container ${showLogin ? 'modal-open' : ''}`}>
          <Login 
            toggle={this.toggleModal}
            showModal={showLogin}
          />
        </div>
      </div>
    );
  }
}

Navigator.propTypes = {
  transmogSetList: PropTypes.array.isRequired,
  fullSourceIDList: PropTypes.object.isRequired,
  visualMetaHash: PropTypes.object.isRequired,
  loadSetData: PropTypes.func.isRequired,
  loadVisualMetaData: PropTypes.func.isRequired,
  loadUserData: PropTypes.func.isRequired,
  addScrapedData: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  fullSourceIDList: state.fullSourceIDList,
  transmogSetList: state.transmogSetList,
  visualMetaHash: state.visualMetaHash
});

const mapDispatchToProps = dispatch => ({
  loadSetData: setData => dispatch({ type: actionTypes.LOAD_TRANSMOG_SETS, data: setData }),
  loadVisualMetaData: visualMetaData => dispatch({
    type: actionTypes.LOAD_VISUAL_META_DATA,
    data: visualMetaData 
  }),
  addScrapedData: newData => dispatch({ type: actionTypes.ADD_SCRAPED_DATA, data: newData }),
  loadUserData: userData => dispatch({
    type: actionTypes.ADD_USER_DATA,
    data: userData
  })
});

export default connect(mapStateToProps, mapDispatchToProps)(Navigator);
