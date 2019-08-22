/* eslint-disable react/forbid-prop-types */
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import axios from 'axios';

import * as actionTypes from '../../store/actions';

import './EditVisual.css';


class EditVisual extends Component {
  constructor(props) {
    super(props);
    this.state = { visualID: null };
  }
    

    componentDidMount() {
      const { match } = this.props;
      if (match.params && match.params.visualID) {
        this.setState({ visualID: match.params.visualID });
      }
    }

    updateVisualMetaName = async (sourceID) => {
      const { visualID } = this.state;
      const { sourceIDHash, visualMetaHash, updateVisualMetaData, history } = this.props;

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
        history.goBack();
      } catch (err) {
        console.log(`Error updating visualMeta for visualID:${visualID}`);
      }
    }

    render() {
      const { visualID } = this.state;
      const { visualMetaHash } = this.props;
        let visualMeta = '';
        let items = '';
        if (visualMetaHash && visualMetaHash[visualID]) {
            const visual = visualMetaHash[visualID];
            const sources = (Array.isArray(visual.sources)) ? visual.sources : [];

            visualMeta = (
              <div className="visual-meta">
                <div className="visual-name">
                  {visual.name}
                </div>
                <div className="instructions">
                        Click an item to promote it to primary name.
                </div>
              </div>
            );
            
            items = (
              <table className="table table-hover table-dark">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Item ID</th>
                  </tr>
                </thead>
                <tbody>
                  {sources.map((row) => (
                    <tr 
                      key={row.sourceID} 
                      onClick={() => this.updateVisualMetaName(row.sourceID)}
                    >
                      <td>{row.name}</td>
                      <td>{row.itemID}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            );
        }

        return (
          <div className="container">
            <div className="visual-panel col-7">
              <div className="container">
                <div className="row">
                  {visualMeta}
                </div>
                <div className="row">
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

EditVisual.propTypes = {
  sourceIDHash: PropTypes.object.isRequired,
  visualMetaHash: PropTypes.object.isRequired,
  updateVisualMetaData: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
    sourceIDHash: state.sourceIDHash,
    visualMetaHash: state.visualMetaHash,
    userData: state.userData,
});

const mapDispatchToProps = (dispatch) => ({
  updateVisualMetaData: (visualMetaData) => dispatch({
    type: actionTypes.UPDATE_VISUAL_META_DATA,
    data: visualMetaData 
  }),
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(EditVisual));
