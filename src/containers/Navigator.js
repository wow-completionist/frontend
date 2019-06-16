import React, { Component } from 'react';
import { Route, NavLink, Switch } from 'react-router-dom';
import { connect } from "react-redux";
import * as actionTypes from '../store/actions';
import axios from 'axios';

import Main from './Main/Main';
import CreateSets from './CreateSets/CreateSets';
import EditSets from './EditSets/EditSets';
import EditVisual from './EditVisual/EditVisual';
import Scraper from './Scraper/Scraper';
// import NewPost from './NewPost/NewPost';
// import FullPost from './FullPost/FullPost';

import './Navigator.css';

class Navigator extends Component {
    async componentDidMount() {
        // Since the Navigator is the main window, we must load the initial state here
        if (!this.props.transmogSetList || this.props.transmogSetList.length === 0) {
            axios.get('http://lvh.me:4000/sets')
                .then(result => {
                    this.props.loadSetData(result.data);
                })
                .catch(err => {console.log(`Error fetching set list: ${err}`);})
        }
        if (!this.props.fullSourceIDList || Object.keys(this.props.fullSourceIDList).length === 0) {
            axios.get('http://lvh.me:4000/items')
                .then(result => {
                    const formattedData = {};
                    result.data.forEach(item => {
                        formattedData[item.sourceID] = item;
                    })
                    this.props.addScrapedData(formattedData);
                })
                .catch(err => {console.log(`Error fetching full item list: ${err}`);})
        }
    }

    render () {
        return (
            <div className="Navigator">
                <header>
                    <nav>
                        <ul>
                            <li>
                                <NavLink to="/"
                                    exact
                                    activeClassName="my-active-link"
                                >
                                    Main
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to='/set/new'
                                    exact
                                    activeClassName="my-active-link"
                                >
                                    Create Sets
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to='/scraper'
                                    exact
                                    activeClassName="my-active-link"
                                >
                                    Scraper
                                </NavLink>
                            </li>
                        </ul>
                    </nav>
                </header>
                <Switch> {/* Optional; specify only one Route match; used when path names are too similar */}
                    <Route path="/" exact component={Main} />
                    <Route path="/set/new" exact component={CreateSets} />
                    <Route path="/set/edit/:setId" exact component={EditSets} />
                    <Route path="/visual/edit/:visualId" exact component={EditVisual} />
                    <Route path="/scraper" exact component={Scraper} />
                    {/* <Route path="/post/:id" exact component={FullPost} /> */}
                </Switch>

            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        fullSourceIDList: state.fullSourceIDList,
        transmogSetList: state.transmogSetList
    }
}

const mapDispatchToProps = dispatch => {
    return {
        addScrapedData: (newData) => dispatch({type: actionTypes.ADD_SCRAPED_DATA, data: newData}),
        loadSetData: (setData) => dispatch({type: actionTypes.LOAD_TRANSMOG_SETS, data: setData})
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(Navigator);
