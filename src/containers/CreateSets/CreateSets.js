/* eslint-disable max-len */
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
  constructor(props) {
    super(props);
    this.state = {
      newSetNameText: '',
      newSetGroupText: '',
      newSetExpansionText: '',
    };
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
      addTransmogSet,
      history,
    } = this.props;
    const {
      newSetNameText,
      newSetGroupText,
      newSetExpansionText
    } = this.state;
    
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
      history.push(`/set/edit/${newSet.setId}`);
    }
  }

  saveSet = async (newSet) => {
    try {
      const result = await axios.post('http://lvh.me:4000/set', { data: newSet });
      console.log('--> result.data :', JSON.stringify(result.data, null, 2));
      return result.data;
    } catch (err) {
      console.log('Axios Error saving set');
      console.log(err);
      return {};
    }
  }

  byCreationDate = (a, b) => {
    const aStamp = new Date(a.createdAt);
    const bStamp = new Date(b.createdAt);
    return bStamp - aStamp;
  }

  render() {
    const { transmogSetList, visualMetaHash, history, } = this.props;
    const { newSetExpansionText, newSetNameText, newSetGroupText } = this.state;

    const workingSetArray = [...transmogSetList];
    let output = '';
    if (workingSetArray) {
      workingSetArray.sort(this.byCreationDate);
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
              {workingSetArray.map((workingSet) => {
                let appearances = '';
                appearances = constants.MOG_SLOTS.map((slot) => {
                  let workingVisualID = workingSet[slot];
                  const visualMetaForSlot = visualMetaHash[workingVisualID];
                  if (visualMetaForSlot) {
                    visualMetaForSlot.visualID = workingVisualID;
                    if (!workingVisualID) {
                      workingVisualID = Math.floor(Math.random() * 10000);
                    }
                    return (
                      <div key={workingVisualID}>
                        <AppearanceText
                          visualMetaForSlot={visualMetaForSlot}
                          categoryID={slot}
                          fetchNameForItem={() => { }}
                          navigateToVisualEdit={() => { }}
                          removeVisualFromSet={() => { }}
                          showEditButtons={false}
                          showEmptySlots={false}
                          emptyClick={() => { }}
                        />
                      </div>
                    );
                  } 
                  return '';
                });
                // }

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
              <label className="formLabel" htmlFor="newSetExpansion">
                Patch:
                <input id="newSetExpansion" className="form-control" placeholder="0.0" onChange={this.newSetExpansionFieldHandler} value={newSetExpansionText} />
              </label>
            </div>
            <div className="col-md-2">
              <label className="formLabel" htmlFor="newSetGroup">
                Class:
                {/* <input id="newSetGroup" className="form-control" placeholder="Class Name or Armor Type" onChange={this.newSetGroupFieldHandler} value={newSetGroupText} /> */}
                <div id="newSetGroup">
                  <select className="form-control" value={newSetGroupText} onChange={this.newSetGroupFieldHandler}>
                    {constants.SET_GROUPS.map((type, i) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </label>
            </div>
            <div className="col">
              <label className="formLabel" htmlFor="newSetName">
                Set Name:
                <input id="newSetName" className="form-control" placeholder="Example: Warmongering Gladiator's Plate" onChange={this.newSetNameFieldHandler} value={newSetNameText} />
              </label>
            </div>
            <div className="col-md-2">
              <button type="submit" className="add-set-button" onClick={() => this.newSetClick()}>New Set</button>
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

const mapStateToProps = (state) => ({
  transmogSetList: state.transmogSetList,
  visualMetaHash: state.visualMetaHash,
});

const mapDispatchToProps = (dispatch) => (
  { addTransmogSet: (newSet) => dispatch({ type: actionTypes.ADD_TRANSMOG_SET, data: newSet }), }
);

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(CreateSets));
