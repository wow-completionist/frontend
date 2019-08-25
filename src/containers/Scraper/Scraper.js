import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import axios from 'axios';

import * as actionTypes from '../../store/actions';
// import constants from '../../constants';

import './Scraper.css';

class Scraper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      input: '',
      filterString: '',
    };
  }

  rawDataFieldHandler = (event) => {
    this.setState({ input: event.target.value });
  }

  addSearchStringHandler = (event) => {
    this.setState({ filterString: event.target.value });
  }

  saveData = async (newList) => {
    try {
      await axios.post('http://lvh.me:4000/import', { data: newList });
    } catch (err) {
      console.log('Axios Error');
      console.log(err);
      console.log(err.config);
    }
  }

  filterByName = (newFilterString, sourceList) => sourceList
    .filter((item) => (
      item && item.name 
      && (newFilterString === '' || item.name.toLowerCase().includes(newFilterString.toLowerCase()))
    ))
    .sort((a, b) => b.sourceID - a.sourceID)
    .slice(0, 50)

  // process and transfer input to output
  async addDataClick() {
    const { input } = this.state;
    const { addScrapedData } = this.props;

    try {
      const parsedData = JSON.parse(input);
      // const newList = { ...sourceIDHash };
      // parsedData.forEach((item, i) => {
      //   parsedData[i].itemModID = `${constants.MOD_ID[parsedData[i].itemModID] || ''}`;
      //   parsedData[i].categoryID = `${constants.CATEGORY[parsedData[i].categoryID] || ''}`;
      //   parsedData[i].invType = `${constants.INVENTORY_TYPE[parsedData[i].invType] || ''}`;
      //   parsedData[i].quality = `${constants.ITEM_QUALITY[parsedData[i].quality] || ''}`;
      //   parsedData[i].sourceType = `${constants.TRANSMOG_SOURCE[parsedData[i].sourceType] || ''}`;
      //   newList[parsedData[i].sourceID] = parsedData[i];
      // });

      await this.saveData(parsedData);
      addScrapedData(parsedData);
      this.setState({ input: '' });
    } catch (err) {
      console.log(err);
    }
  }

  render() {
    const { input, filterString } = this.state;
    const { sourceList } = this.props;
    
    const filteredList = this.filterByName(filterString, sourceList);

    let output = '';
    if (sourceList.length > 0) {
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
              {filteredList.map((row) => (
                <tr className={row.isCollected ? 'green' : ''} key={row.sourceID}>
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
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <div className="Scraper">
        <div className="form-group">
          <label htmlFor="rawInput">
            Input:
            <textarea
              id="rawInput"
              className="form-control"
              rows="5"
              placeholder="Paste Data Here"
              onChange={this.rawDataFieldHandler}
              value={input}
            />
          </label>
        </div>
        <div className="button-group">
          <button
            type="button"
            onClick={() => this.addDataClick()}
          >
            Add Data
          </button>
        </div>
        <div className="filters form-group">
          <label htmlFor="filterString">
            Search:
            <input
              id="filterString"
              className="form-control"
              placeholder="search for..."
              onChange={this.addSearchStringHandler}
              value={filterString}
              autoComplete="off"
            />
          </label>
        </div>
        <div className="outputField">
          {output}
        </div>
      </div>
    );
  }
}

Scraper.propTypes = {
  sourceList: PropTypes.array.isRequired,
  addScrapedData: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  sourceList: state.sourceList,
  userData: state.userData,
});

const mapDispatchToProps = (dispatch) => ({
  addScrapedData: (newData) => dispatch({
    type: actionTypes.ADD_SOURCE_DATA,
    data: newData
  }),
});

export default connect(mapStateToProps, mapDispatchToProps)(Scraper);
