/* eslint-disable react/no-unused-prop-types */
/* eslint-disable no-console */
/* eslint-disable react/forbid-prop-types */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import axios from 'axios';

import * as db from '../../db';
import * as actionTypes from '../../store/actions';

import './CollectionInput.css';

class CollectionInput extends Component {
  state = { input: '' }

  rawDataFieldHandler = (event) => {
    this.setState({ input: event.target.value });
  }

  async addDataClick() {
    const { input } = this.state;
    const { loadUserCollection, userData } = this.props;
    const sourceArray = input.replace(/['"]+/g, '').split(':');
    const collected = sourceArray.filter(s => s !== '').map(s => parseInt(s, 10));
    userData.collected = collected;
    loadUserCollection(userData);
    db.putData('userData', userData);

    try {
      await axios.post(`http://lvh.me:4000/collected/${userData.userId}`, collected);
      this.setState({ input: '' });
    } catch (err) {
      console.log('Axios error saving collected');
      console.log(err);
    }
  }

  render() {
    const { input } = this.state;

    return (
      <div className="row">
        <div className="col">
          <p>
            Tracking your collected transmog on this website requires the use
            of the Completionist addon, which can be installed through the
            <a 
              href="https://www.curseforge.com/twitch-client" 
              rel="noopener noreferrer" 
              target="_blank" 
              className="basic-link"
            >
              Twitch Desktop App.
            </a>
          </p>
          <p>
            Once you have installed the Completionist addon, log in and type "/comp transmog".
            The game might freeze for a moment. A window will pop up displaying a list of numbers.
            Use Ctrl-C to copy, then paste it all in the window over there ---->
          </p>
        </div>
        <div className="col">
          <div className="form-group">
            <label htmlFor="rawInput">Input:</label>
            <textarea 
              id="rawInput" 
              className="form-control"
              rows="5"
              placeholder="Paste Data Here"
              onChange={this.rawDataFieldHandler}
              value={input}
            />
            <button 
              type="button"
              onClick={() => this.addDataClick()}
              className="add-data-button"
            >
              Add Data
            </button>
          </div>
        </div>
      </div>
    );
  }
}

CollectionInput.propTypes = {
  userData: PropTypes.object.isRequired, 
  loadUserCollection: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({ userData: state.userData });

const mapDispatchToProps = dispatch => ({
  loadUserCollection: collected => dispatch({
    type: actionTypes.ADD_USER_DATA,
    data: collected
  }),
});

export default connect(mapStateToProps, mapDispatchToProps)(CollectionInput);
