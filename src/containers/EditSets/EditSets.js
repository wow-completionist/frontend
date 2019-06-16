import React, { Component } from 'react';
import {withRouter} from 'react-router-dom';
import { connect } from "react-redux";
import * as actionTypes from '../../store/actions';
import constants from '../../constants'

import './EditSets.css';

import axios from 'axios';
import AppearanceText from '../../component/AppearanceText/AppearanceText';

class EditSets extends Component {
    state = {
        filterString: '',
        selectedSet: null,
        selectedVisualId: null,
        setId: null
    }

    componentDidMount() {
        this.setState({setId: this.props.match.params.setId });
    }

    async componentDidUpdate() {
        if (this.state.setId && this.state.selectedVisualId) {
            const visualID = this.state.selectedVisualId;
            this.setState({selectedVisualId: null})
            const result = await axios.post("http://lvh.me:4000/set/" + this.state.setId, {visualID})
            console.log(`--> adding visual ID ${visualID} to set result :`, result);
            this.props.addVisualToSet(this.state.setId, visualID)
        }
    }

    searchFieldHandler = (event) => {
        this.setState({filterString: event.target.value});
    }

    setSelected = (type, value) => {
        if (type === 'set') {
            this.setState({selectedSet: value});
        } else if (type === 'visual') {
            this.setState({selectedVisualId: value});
        }
    }

    fetchNameForItem = async (sourceId) => {
        const result = await axios.post("http://lvh.me:4000/item/" + sourceId);

        const fullSourceIDList = Object.assign({}, this.props.fullSourceIDList);
        fullSourceIDList[sourceId].name = result.data.name;
        this.props.addScrapedData(fullSourceIDList);
    }

    render () {
        let sets = '';
        if (this.state.setId && this.props.transmogSetList && this.props.transmogSetList.length > 0) {
            const workingSet = this.props.transmogSetList.find(row => row.setId === this.state.setId);
            let itemList = '';
            if (workingSet.visuals && this.props.visualIdHash) {
                itemList = constants.MOG_SLOTS.map(slot => (
                    <AppearanceText
                        key = {Math.random().toString(36).replace(/[^a-z]+/g, '')}
                        categoryID = {slot}
                        visualIDs = {workingSet.visuals}
                        visualIdHash = {this.props.visualIdHash}
                        handleClick = {(visualID) => this.props.history.push(`/visual/edit/${visualID}`)}
                    />
                ))
            }

            sets = (
                <div className="setPanel">
                    <div className="panelRow">
                        <div className="panelData">
                            Set Name: {workingSet.name}
                        </div>
                        <div className="panelData">
                            Group: {workingSet.group}
                        </div>
                        <div className="panelData">
                        Expansion: {workingSet.expansion}
                        </div>
                    </div>
                    <div className="panelRow">
                        <div className="panelData">
                            Items: {itemList}
                        </div>
                    </div>
                </div>
            );
        }
        let items = '';
        if (this.state.filterString.length > 2 && Object.values(this.props.fullSourceIDList).length > 0) {
            items = (
                <table className="table table-hover table-dark">
                    <thead>
                        <tr>
                            <th scope="col">Name</th>
                            <th scope="col">Item ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.values(this.props.fullSourceIDList)
                            .filter(item => item.name && item.name.toLowerCase().includes(this.state.filterString))
                            .map((row,i) => {
                                let rowClass = '';
                                if (row.visualID === this.state.selectedVisualId) {
                                    console.log('--> row.itemID :', row.itemID);
                                    rowClass = 'green';
                                }
                                if (row.isCollected) {rowClass += 'collected';}
                                
                                // TODO: Fix highlighting
                                
                                return (
                                    <tr 
                                        key={row.sourceID} 
                                        onClick={() => this.setSelected('visual', row.visualID)} 
                                        className={rowClass}
                                    >
                                        <td>{row.name}</td>
                                        <td>{row.itemID}</td>
                                        <td>{row.isCollected ? "✅" : ""}</td>
                                    </tr>
                                );
                            })
                            .slice(0,100)
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
                                <label className="editFormLabel" htmlFor="filterString">Search:</label>
                                <input id="filterString" className="form-control" placeholder="Type item name to start" onChange={this.searchFieldHandler} value={this.state.filterString} />
                            </div>
                            <div className="data-table">
                                {items}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        transmogSetList: state.transmogSetList,
        fullSourceIDList: state.fullSourceIDList,
        visualIdHash: state.visualIdHash
    }
}

const mapDispatchToProps = dispatch => {
    return {
        addVisualToSet: (changingSet,incomingVisualId) => dispatch({type: actionTypes.ADD_VISUAL_TO_SET, data: {changingSet,incomingVisualId}}),
        addScrapedData: (newData) => dispatch({type: actionTypes.ADD_SCRAPED_DATA, data: newData})
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(withRouter(EditSets));
