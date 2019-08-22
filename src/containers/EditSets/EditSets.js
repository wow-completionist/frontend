/* eslint-disable react/forbid-prop-types */
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import axios from 'axios';
import PropTypes from 'prop-types';

import AppearanceText from '../../component/AppearanceText/AppearanceText';
import * as actionTypes from '../../store/actions';
import constants from '../../constants';
import './EditSets.css';

class EditSets extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filterString: '',
      selectedSlot: null,
      setId: null,
      renamingSet: false,
      newName: ''
    };
  }
  

  componentDidMount() {
    const { match } = this.props;
    const { setId } = this.state;
    if (setId !== match.params.setId) {
      this.setState({ setId: match.params.setId });
    }
  }

  searchFieldHandler = (event) => {
    this.setState({ filterString: event.target.value });
  }

  setSelected = async (type, value) => {
    const { selectedSlot } = this.state;
    const { setId } = this.state;

    const { addVisualToSet } = this.props;

    if (type === 'slot') {
      this.setState({ selectedSlot: value });
    } else if (type === 'visual' && selectedSlot) {
      const { sourceID, visualID } = value;

      const result = await axios.post(`http://lvh.me:4000/set/${setId}`, { visualID, slot: selectedSlot });
      console.log(`--> adding visual ID ${visualID} to slot ${selectedSlot}. Result :`, result);

      await this.updateVisualMetaName(sourceID, visualID);

      addVisualToSet(setId, selectedSlot, sourceID);
      this.setState({ selectedSlot: null });
    }
  }

  updateVisualMetaName = async (sourceID, visualID) => {
    const { sourceIDHash, visualMetaHash, updateVisualMetaData } = this.props;

    const newName = sourceIDHash[sourceID].name;
    
    try {
      const updateObject = { ...visualMetaHash[visualID] };
      updateObject.name = newName;
      delete updateObject.sources;

      const result = await axios.post(`http://lvh.me:4000/visuals/${visualID}`, updateObject);
      console.log('--> axios visualMeta update result :', result);
      
      const newVisualMeta = visualMetaHash[visualID];
      newVisualMeta.name = newName;
      updateVisualMetaData([newVisualMeta]);
    } catch (err) {
      console.log(`Error updating visualMeta for visualID:${visualID}`);
    }
  }

  setNameHandler = (event) => {
    this.setState({ newName: event.target.value });
  }

  startRename = async (currentName) => {
    window.addEventListener('keydown', this.keyDownHandler);
    this.setState({ renamingSet: true, newName: currentName });
  }

  renameSet = async (e) => {
    e.preventDefault();
    window.removeEventListener('keydown');

    const { updateSetName } = this.props;
    const { newName } = this.state;

    if (newName === '') {
      // TODO: Throw error
      return;
    }

    const { setId } = this.state;

    const result = await axios.post(`http://lvh.me:4000/set/${setId}`, { name: newName });
    console.log(`--> Renaming set to ${newName}. Result :`, result);

    // Update data in reducer
    updateSetName(setId, newName);
    this.setState({ renamingSet: false });
  }

  keyDownHandler = (e) => {
    const { renamingSet } = this.state;
    if (e.key === 'Escape' && renamingSet) {
      this.setState({ renamingSet: false });
    }
  }

  removeVisualFromSet = async (slot, visualID) => {
    const { setId } = this.state;
    const { removeVisualFromSet } = this.props;

    try {
      await axios.delete(`http://lvh.me:4000/set/${setId}/slot/${slot}/visual/${visualID}`);
      removeVisualFromSet(setId, slot, visualID);
    } catch (err) {
      console.log('--> remove visual from set error :', err);
    }
  }

  handleKeyPress = () => {
    // TODO handle key press
  }

  render() {
    const {
      setId,
      filterString,
      selectedSlot,
      renamingSet,
      newName
    } = this.state;

    const {
      transmogSetList,
      visualMetaHash,
      history,
      sourceList
    } = this.props;

    let sets = '';
    
    if (setId && transmogSetList && transmogSetList.length > 0) {
      const workingSet = transmogSetList.find((row) => row.setId === setId);
      let slotList = [];

      slotList = constants.MOG_SLOTS.map((slot) => {
        const workingVisualID = workingSet[slot];
        const visualMetaForSlot = visualMetaHash[workingVisualID];
        if (visualMetaForSlot) visualMetaForSlot.visualID = workingVisualID;
        return (
          <div 
            className={selectedSlot === slot ? 'selected' : ''}
            key={Math.random().toString(36).replace(/[^a-z]+/g, '')}
          >
            <AppearanceText
              visualMetaForSlot={visualMetaForSlot}
              categoryID={slot}
              tabIndex={slot}
              navigateToVisualEdit={(visualID) => history.push(`/visual/edit/${visualID}`)}
              removeVisualFromSet={(visualID) => this.removeVisualFromSet(slot, visualID)}
              emptyClick={() => this.setSelected('slot', slot)}
            />
          </div>
        ); 
      });

      let setNameDiv;
      if (renamingSet) {
        setNameDiv = (
          <form className="filters form-group" onSubmit={(e) => this.renameSet(e)}>
            Set Name: 
            <input 
              id="filterString" 
              className="form-control" 
              placeholder="Type new set name here" 
              onChange={this.setNameHandler}
              value={newName}
              autoComplete="off"
            />
            <button
              className="hidden"
              type="submit"
              aria-label="submit" 
            />
          </form>
        );
      } else {
        const text = `Set Name: ${workingSet.name}`;
        setNameDiv = (
          <div
            onClick={() => this.startRename(workingSet.name)}
            onKeyPress={this.handleKeyPress}
            role="button"
            tabIndex="0"
          >
            {text}
          </div>
        );
      }

      sets = (
        <div className="setPanel">
          <div className="panelRow">
            <div className="panelData">
              {setNameDiv}
            </div>
            <div className="panelData">
              {`Group: ${workingSet.group}`}
            </div>
            <div className="panelData">
              {`Patch: ${workingSet.expansion}`}
            </div>
          </div>
          <div className="panelRow">
            <div className="panelData">
              {'Items: '}
              {slotList}
            </div>
          </div>
        </div>
      );
    }
    let items = '';
    if (selectedSlot) {
      items = (
        <table className="table table-hover table-dark">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Item ID</th>
            </tr>
          </thead>
          <tbody>
            {sourceList
              .filter((source) => source.name 
                && Number(source.categoryID) === Number(selectedSlot)
                && !visualMetaHash[source.visualID].isAssigned
                && (
                  source.name.toLowerCase().includes(filterString.toLowerCase())
                  || source.itemID.toString().includes(filterString)))
              .sort((a, b) => b.itemID - a.itemID)
              .map((row) => {
                let rowClass = '';
                if (row.isCollected) { rowClass += 'collected'; }

                return (
                  <tr
                    key={row.sourceID}
                    onClick={() => this.setSelected('visual', row)}
                    className={rowClass}
                  >
                    <td>{row.name}</td>
                    <td>{row.itemID}</td>
                    <td>{row.isCollected ? '✅' : ''}</td>
                  </tr>
                );
              })
              .slice(0, 100)
            }
          </tbody>
        </table>
      );
    }

    return (
      <div className="EditSets">
        <div className="container">
          <div className="row">
            <div className="col-7">
              <div className="data-table">
                {sets}
              </div>
            </div>
            <div className="col-5">
              <div className="filters form-group">
                <input 
                  id="filterString" 
                  className="form-control" 
                  placeholder="Type item name here to start filtering..." 
                  onChange={this.searchFieldHandler} 
                  value={filterString} 
                  autoComplete="off"
                />
              </div>
              <div className="data-table">
                {items}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

EditSets.propTypes = {
  transmogSetList: PropTypes.array.isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  visualMetaHash: PropTypes.object.isRequired,
  sourceList: PropTypes.array.isRequired,
  sourceIDHash: PropTypes.object.isRequired,
  addVisualToSet: PropTypes.func.isRequired,
  updateSetName: PropTypes.func.isRequired,
  removeVisualFromSet: PropTypes.func.isRequired,
  updateVisualMetaData: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  transmogSetList: state.transmogSetList,
  sourceList: state.sourceList,
  sourceIDHash: state.sourceIDHash,
  visualMetaHash: state.visualMetaHash,
});

const mapDispatchToProps = (dispatch) => ({
  addVisualToSet: (changingSet, slot, sourceID) => dispatch({
    type: actionTypes.ADD_VISUAL_TO_SET,
    data: { changingSet, slot, sourceID }
  }),  
  updateSetName: (changingSet, newName) => dispatch({
    type: actionTypes.RENAME_TRANSMOG_SET,
    data: { changingSet, newName }
  }),  
  removeVisualFromSet: (changingSet, slot, visualID) => dispatch({
    type: actionTypes.REMOVE_VISUAL_FROM_SET,
    data: { changingSet, slot, visualID }
  }),
  updateVisualMetaData: (visualMetaData) => dispatch({
    type: actionTypes.UPDATE_VISUAL_META_DATA,
    data: visualMetaData 
  }),
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(EditSets));
