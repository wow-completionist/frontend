import React, { Component } from 'react';
import { connect } from "react-redux";
import * as actionTypes from '../../store/actions';
import constants from '../../constants';

import axios from 'axios';

import './Scraper.css';

class Scraper extends Component {
    state = {
        input: '',
        filterString: '',
        filteredList: [],
        saveState: '',
        localFullList: {}
    }

    componentDidMount() {
        this.setState({localFullList: this.props.fullSourceIDList})
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.fullSourceIDList !== prevProps.fullSourceIDList) {
            this.setState({localFullList: this.props.fullSourceIDList})
        }
        if (this.state.localFullList !== prevState.localFullList) {
            this.updateFilteredList({});
        }
    }
    
    rawDataFieldHandler = (event) => {
        this.setState({input: event.target.value});
    }

    addSearchStringHandler = (event) => {
        this.setState({filterString: event.target.value})
        this.updateFilteredList({filterString: event.target.value});
    }

    saveData = async ({fullSourceIDList = this.props.fullSourceIDList}) => {
        try {
            this.setState({saveState: 'Saving...'})
            await axios.post('http://lvh.me:4000/dump', fullSourceIDList);
            this.setState({saveState: ''});
        } catch (err) {
            console.log('Axios Error')
            console.log(err)
            console.log(err.config)
            this.setState({saveState: 'Save Error'});

        }
    }

    updateFilteredList = ({fullSourceIDList = Object.values(this.state.localFullList), filterString = this.state.filterString}) => {
        const snip = fullSourceIDList
            .filter(item => this.state.filterString !== '' ? item.name ? item.name.toLowerCase().includes(this.state.filterString.toLowerCase()) : false : true)
            .sort((a,b) => b.sourceID - a.sourceID)
            .slice(0, 50)
        this.setState({filteredList: snip});
    }

    addDataClick() {
        // process and transfer input to output
        try {
            const parsedData = JSON.parse(this.state.input);
            const newList = {...this.state.localFullList};
            parsedData.forEach((item,i) => {
                parsedData[i].itemModID = `${constants.MOD_ID[parsedData[i].itemModID] || ''}`;
                parsedData[i].categoryID = `${constants.CATEGORY[parsedData[i].categoryID] || ''}`;
                parsedData[i].invType = `${constants.INVENTORY_TYPE[parsedData[i].invType] || ''}`;
                parsedData[i].quality = `${constants.ITEM_QUALITY[parsedData[i].quality] || ''}`;
                parsedData[i].sourceType = `${constants.TRANSMOG_SOURCE[parsedData[i].sourceType] || ''}`;
                newList[parsedData[i].sourceID] = parsedData[i];
            })
    
            this.setState({input: ''});
            this.props.addScrapedData(newList);
        } catch (err) {
            console.log(err)
        }
    }

    render () {
        let output = '';
        if (Object.keys(this.state.localFullList).length > 0) {
            output = (
                <div className="data-table">
                    <table className="table table-hover table-dark">
                        <thead>
                            <tr>
                                <th scope="col">sourceID</th>
                                <th scope="col">itemID</th>
                                <th scope="col">name</th>
                                <th scope="col">invType</th>
                                <th scope="col">visualID</th>
                                <th scope="col">quality</th>
                                <th scope="col">itemModID</th>
                                <th scope="col">categoryID</th>
                                <th scope="col">sourceType</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.filteredList.map((row,i) => {
                                return (
                                    <tr className={row.isCollected ? 'green' : ''} key={row.sourceID} >
                                        <th scope="row">{row.sourceID}</th>
                                        <td>{row.itemID}</td>
                                        <td>{row.name}</td>
                                        <td>{row.invType}</td>
                                        <td>{row.visualID}</td>
                                        <td>{row.quality}</td>
                                        <td>{row.itemModID}</td>
                                        <td>{row.categoryID}</td>
                                        <td>{row.sourceType}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            );
        }

        return (
            <div className="Scraper">
                <div className="form-group">
                    <label htmlFor="rawInput">Input:</label>
                    <textarea id="rawInput" className="form-control" rows="5" placeholder="Paste Data Here" onChange={this.rawDataFieldHandler} value={this.state.input} />
                </div>
                <div className="button-group">
                    <button onClick={() => this.addDataClick()}>Add Data</button>
                    {this.props.saveState}
                </div>
                <div className="filters form-group">
                    <label htmlFor="filterString">Search:</label>
                    <input id="filterString" className="form-control" placeholder="search for..." onChange={this.addSearchStringHandler} value={this.state.filterString} />
                </div>
                <div className="outputField">
                    {output}
                </div>
            </div>
        )
    }
}


const mapStateToProps = state => {
    return {
        fullSourceIDList: state.fullSourceIDList
    }
}

const mapDispatchToProps = dispatch => {
    return {
        addScrapedData: (newData) => dispatch({type: actionTypes.ADD_SCRAPED_DATA, data: newData}),
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(Scraper);
