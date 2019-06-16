import React, { Component } from 'react';
import {withRouter} from 'react-router-dom';
import { connect } from "react-redux";
import * as actionTypes from '../../store/actions';

import './CreateSets.css';
import axios from 'axios';
import AppearanceText from '../../component/AppearanceText/AppearanceText';
import constants from '../../constants'

class CreateSets extends Component {
    state = {
        newSetNameText: '',
        newSetGroupText: '',
        newSetExpansionText: '8.0'
    }

    newSetNameFieldHandler = (event) => {
        this.setState({newSetNameText: event.target.value});
    }

    newSetExpansionFieldHandler = (event) => {
        this.setState({newSetExpansionText: event.target.value});
    }

    newSetGroupFieldHandler = (event) => {
        this.setState({newSetGroupText: event.target.value});
    }

    newSetClick = async () => {
        const newSet = {
            name: this.state.newSetNameText,
            group: this.state.newSetGroupText,
            expansion: this.state.newSetExpansionText
        }
        const result = await this.saveSet(newSet);
        
        if (result.setId) {
            newSet.setId = result.setId;
            this.props.addTransmogSet(newSet);
            this.setState({newSetNameText: ''});
        }
    }

    saveSet = async (newSet) => {
        try {
            this.setState({saveState: 'Saving...'})
            const result = await axios.post('http://lvh.me:4000/set', newSet);
            console.log('--> result.data :', JSON.stringify(result.data, null, 2));
            this.setState({saveState: ''});
            return result.data;
        } catch (err) {
            console.log('Axios Error')
            console.log(err)
            console.log(err.config)
            this.setState({saveState: 'Save Error'});
            return {}
        }
    }

    render () {
        let output = '';
        if (this.props.transmogSetList && this.props.transmogSetList.length > 0) {
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
                            {this.props.transmogSetList.map((row,i) => {
                                let appearances = '';
                                if (row.visuals && this.props.visualIdHash) {
                                    appearances = constants.MOG_SLOTS.map(slot => {
                                        return (
                                            <AppearanceText
                                                key = {Math.random().toString(36).replace(/[^a-z]+/g, '')}
                                                categoryID = {slot}
                                                visualIDs = {row.visuals}
                                                visualIdHash = {this.props.visualIdHash}
                                            />  
                                        )
                                    });
                                }

                                return (
                                    <tr 
                                        key={row.setId} 
                                        className={row.isCollected ? 'd-flex green' : 'd-flex'} 
                                        onClick={() => this.props.history.push(`/set/edit/${row.setId}`)}
                                    >
                                        <td className="col-1">{row.expansion}</td>
                                        <td className="col-3">{row.group}</td>
                                        <td className="col-3">{row.name}</td>
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
                            {this.props.saveState}
                        </div>
                    </div>
                </div>
                {/* <div className="filters form-group">
                    <label htmlFor="filterString">Search:</label>
                    <input id="filterString" className="form-control" placeholder="search for..." onChange={this.addSearchStringHandler} value={this.state.filterString} />
                </div> */}
                <div className="outputField">
                    {output}
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        transmogSetList: state.transmogSetList,
        visualIdHash: state.visualIdHash
    }
}

const mapDispatchToProps = dispatch => {
    return {
        addTransmogSet: (newSet) => dispatch({type: actionTypes.ADD_TRANSMOG_SET, data: newSet}),
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(withRouter(CreateSets));
