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
  state = {
    filterString: '',
    selectedSlot: null,
    setId: null
  }

  componentDidMount() {
    const { match } = this.props;
    this.setState({ setId: match.params.setId });
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
      // TODO: assign visual to slot
      const visualID = value;

      const result = await axios.post(`http://lvh.me:4000/set/${setId}`, { visualID });
      console.log(`--> adding visual ID ${visualID} to set result :`, result);
      this.setState({ selectedSlot: null });
      addVisualToSet(setId, visualID);
    }
  }

  fetchNameForItem = async (sourceId) => {
    const { addScrapedData, fullSourceIDList } = this.props;
    const result = await axios.post(`http://lvh.me:4000/item/fetchName/${sourceId}`);

    const workingSourceIDList = Object.assign({}, fullSourceIDList);
    workingSourceIDList[sourceId].name = result.data.name;
    addScrapedData(workingSourceIDList);
  }

  removeVisualFromSet = async (visualID) => {
    const { setId } = this.state;
    const { removeVisualFromSet } = this.props;
    const result = await axios.delete(`http://lvh.me:4000/set/${setId}/visual/${visualID}`);
    console.log('--> result :', result);
    removeVisualFromSet(setId, visualID);
  }

  render() {
    const {
      setId,
      filterString,
      selectedSlot,
    } = this.state;

    const {
      transmogSetList,
      visualMetaHash,
      history,
      fullSourceIDList
    } = this.props;

    let sets = '';
    if (setId && transmogSetList && transmogSetList.length > 0) {
      const workingSet = transmogSetList.find(row => row.setId === setId);
      let itemList = '';
      if (workingSet.visuals) {
        itemList = constants.MOG_SLOTS.map((slot, i) => {
          const workingVisualID = workingSet.visuals
            .find(visualID => visualMetaHash[visualID].categoryID === slot);
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
                tabIndex={i}
                fetchNameForItem={this.fetchNameForItem}
                navigateToVisualEdit={visualID => history.push(`/visual/edit/${visualID}`)}
                removeVisualFromSet={visualID => this.removeVisualFromSet(visualID)}
                actions
                emptyClick={() => this.setSelected('slot', slot)}
              />
            </div>
          ); 
        });
      }

      sets = (
        <div className="setPanel">
          <div className="panelRow">
            <div className="panelData">
              {`Set Name:${workingSet.name}`}
            </div>
            <div className="panelData">
              {`Group:${workingSet.group}`}
            </div>
            <div className="panelData">
              {`Patch:${workingSet.expansion}`}
            </div>
          </div>
          <div className="panelRow">
            <div className="panelData">
              {'Items: '}
              {itemList}
            </div>
          </div>
        </div>
      );
    }
    let items = '';
    if (selectedSlot && Object.values(fullSourceIDList).length > 0) {
      console.log('--> selectedSlot :', selectedSlot);
      items = (
        <table className="table table-hover table-dark">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Item ID</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(fullSourceIDList)
              .filter(source => source.name 
                && source.categoryID === selectedSlot
                && !visualMetaHash[source.visualID].isAssigned
                && source.name.toLowerCase().includes(filterString))
              .sort((a, b) => b.itemID - a.itemID)
              .map((row) => {
                let rowClass = '';
                if (row.isCollected) { rowClass += 'collected'; }

                // TODO: Fix highlighting

                return (
                  <tr
                    key={row.sourceID}
                    onClick={() => this.setSelected('visual', row.visualID)}
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
  fullSourceIDList: PropTypes.object.isRequired,
  addScrapedData: PropTypes.func.isRequired,
  addVisualToSet: PropTypes.func.isRequired,
  removeVisualFromSet: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  transmogSetList: state.transmogSetList,
  fullSourceIDList: state.fullSourceIDList,
  visualMetaHash: state.visualMetaHash,
});

const mapDispatchToProps = dispatch => ({
  addVisualToSet: (changingSet, visualID) => dispatch({
    type: actionTypes.ADD_VISUAL_TO_SET,
    data: { changingSet, visualID }
  }),  
  removeVisualFromSet: (changingSet, visualID) => dispatch({
    type: actionTypes.REMOVE_VISUAL_FROM_SET,
    data: { changingSet, visualID }
  }),
  addScrapedData: newData => dispatch({ type: actionTypes.ADD_SCRAPED_DATA, data: newData })
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(EditSets));
