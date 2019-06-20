/* eslint-disable react/forbid-prop-types */
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import axios from 'axios';
import PropTypes from 'prop-types';

import * as actionTypes from '../../store/actions';
import AppearanceText from '../../component/AppearanceText/AppearanceText';
import constants from '../../constants';

import './CreateSets.css';

class CreateSets extends Component {
  state = {
    newSetNameText: '',
    newSetGroupText: '',
    newSetExpansionText: '8.0'
  }

  newSetNameFieldHandler = (event) => {
    this.setState({ newSetNameText: event.target.value });
  }

  newSetExpansionFieldHandler = (event) => {
    this.setState({ newSetExpansionText: event.target.value });
  }

  newSetGroupFieldHandler = (event) => {
    this.setState({ newSetGroupText: event.target.value });
  }

  newSetClick = async () => {
    const {
      newSetNameText,
      newSetGroupText,
      newSetExpansionText
    } = this.state;
    const { addTransmogSet } = this.props;
    const newSet = {
      name: newSetNameText,
      group: newSetGroupText,
      expansion: newSetExpansionText
    };
    const result = await this.saveSet(newSet);

    if (result.setId) {
      newSet.setId = result.setId;
      addTransmogSet(newSet);
      this.setState({ newSetNameText: '' });
    }
  }

  saveSet = async (newSet) => {
    try {
      const result = await axios.post('http://lvh.me:4000/set', newSet);
      console.log('--> result.data :', JSON.stringify(result.data, null, 2));
      return result.data;
    } catch (err) {
      console.log('Axios Error');
      console.log(err);
      return {};
    }
  }

  render() {
    const {
      transmogSetList,
      visualMetaHash,
      history,
    } = this.props;
    let output = '';
    if (transmogSetList && transmogSetList.length > 0) {
      output = (
        <div className="data-table">
          <table className="table table-hover table-dark">
            <thead>
              <tr className="d-flex">
                <th className="col-1">Ex.</th>
                <th className="col-3">Group</th>
                <th className="col-3">Name</th>
                <th className="col">Items</th>
              </tr>
            </thead>
            <tbody>
              {transmogSetList.map((workingSet) => {
                let appearances = '';
                if (workingSet.visuals) {
                  appearances = constants.MOG_SLOTS.map((slot) => {
                    const workingVisualID = workingSet.visuals
                      .find(visualID => visualMetaHash[visualID].categoryID === slot);
                    const visualMetaForSlot = visualMetaHash[workingVisualID];
                    if (visualMetaForSlot) visualMetaForSlot.visualID = workingVisualID;

                    return (
                      <div
                        key={Math.random().toString(36).replace(/[^a-z]+/g, '')}
                      >
                        <AppearanceText
                          visualMetaForSlot={visualMetaForSlot}
                          categoryID={slot}
                          visualIDs={workingSet.visuals}
                          fetchNameForItem={() => { }}
                          navigateToVisualEdit={() => { }}
                          removeVisualFromSet={() => { }}
                          actions={false}
                          emptyClick={() => { }}
                        />
                      </div>
                    );
                  });
                }

                return (
                  <tr
                    key={workingSet.setId}
                    className={workingSet.isCollected ? 'd-flex green' : 'd-flex'}
                    onClick={() => history.push(`/set/edit/${workingSet.setId}`)}
                  >
                    <td className="col-1">{workingSet.expansion}</td>
                    <td className="col-3">{workingSet.group}</td>
                    <td className="col-3">{workingSet.name}</td>
                    <td className="col">{appearances}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <div className="CreateSets">
        <div className="form-group">
          <div className="row">
            <div className="col-md-1">
              <label className="formLabel" htmlFor="newSetExpansion">Patch:</label>
              <input id="newSetExpansion" className="form-control" placeholder="Example: 6.2" onChange={this.newSetExpansionFieldHandler} value={this.state.newSetExpansionText} />
            </div>
            <div className="col">
              <label className="formLabel" htmlFor="newSetName">Set Name:</label>
              <input id="newSetName" className="form-control" placeholder="Example: Warmongering Gladiator's Plate" onChange={this.newSetNameFieldHandler} value={this.state.newSetNameText} />
            </div>
            <div className="col">
              <label className="formLabel" htmlFor="newSetGroup">Set Group:</label>
              <input id="newSetGroup" className="form-control" placeholder="Example: Warlord's PvP Sets" onChange={this.newSetGroupFieldHandler} value={this.state.newSetGroupText} />
            </div>
            <div className="col-md-1">
              <button onClick={() => this.newSetClick()}>New Set</button>
            </div>
          </div>
        </div>
        <div className="outputField">
          {output}
        </div>
      </div>
    );
  }
}

CreateSets.propTypes = {
  transmogSetList: PropTypes.array.isRequired,
  history: PropTypes.object.isRequired,
  visualMetaHash: PropTypes.object.isRequired,
  addTransmogSet: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  transmogSetList: state.transmogSetList,
  visualMetaHash: state.visualMetaHash
});

const mapDispatchToProps = dispatch => (
  { addTransmogSet: newSet => dispatch({ type: actionTypes.ADD_TRANSMOG_SET, data: newSet }), }
);

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(CreateSets));
