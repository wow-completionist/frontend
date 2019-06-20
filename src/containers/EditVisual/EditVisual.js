import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import * as actionTypes from '../../store/actions';

import './EditVisual.css';

import axios from 'axios';

class EditVisual extends Component {
    state = { visualId: null, }

    componentDidMount() {
        this.setState({ visualId: this.props.match.params.visualId });
    }

    setSelected = (type, value) => {
        if (type === 'set') {
            this.setState({ selectedSet: value });
        } else if (type === 'visual') {
            this.setState({ selectedVisualId: value });
        }
    }

    fetchNameForItem = async (sourceId) => {
        const result = await axios.post(`http://lvh.me:4000/item/fetchName/${sourceId}`);

        const fullSourceIDList = Object.assign({}, this.props.fullSourceIDList);
        fullSourceIDList[sourceId].name = result.data.name;
        this.props.addScrapedData(fullSourceIDList);
    }

    updateVisualMetaName = async (sourceId) => {
        const newPrimary = this.props.fullSourceIDList[sourceId];
        const oldPrimary = Object.values(this.props.fullSourceIDList)
            .filter(source => source.visualID === newPrimary.visualID && source.isPrimary);
        
        // Prevent spamming same change
        if (oldPrimary.length === 1 && oldPrimary[0].sourceID === sourceId) return;

        const changeSet = {};
        oldPrimary.forEach((source) => {
            source.isPrimary = false;
            changeSet[source.sourceID] = source;
        });
        newPrimary.isPrimary = true;
        changeSet[sourceId] = newPrimary;
        
        const result = await axios.post('http://lvh.me:4000/dump/', changeSet);
        console.log('--> updateVisualMetaName result :', result.data);
        this.props.addScrapedData(changeSet);
    }

    render() {
        let visualMeta = '';
        let items = '';
        if (this.props.visualMetaHash[this.state.visualId]) {
            const visual = this.props.visualMetaHash[this.state.visualId];
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
                  {visual.sources.map((row, i) => (
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

const mapStateToProps = state => ({
        fullSourceIDList: state.fullSourceIDList,
        visualMetaHash: state.visualMetaHash
    });

const mapDispatchToProps = dispatch => ({ addScrapedData: newData => dispatch({ type: actionTypes.ADD_SCRAPED_DATA, data: newData }) });

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(EditVisual));
