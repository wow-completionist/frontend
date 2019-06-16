import React, { Component } from 'react';
import { connect } from "react-redux";

// import axios from 'axios';

// import './Scraper.css';
// import constants from '../../constants';

class Main extends Component {
    render () {
        // let output = <div></div>;
        // if (this.props.transmogSetList.length > 0) {
        //     output = (
        //         <div className="data-table">
        //             <table className="table">
        //                 <thead>
        //                     <tr>
        //                         <th scope="col">Set ID</th>
        //                         <th scope="col">Name</th>
        //                         <th scope="col">Expansion</th>
        //                         <th scope="col">Items</th>
        //                     </tr>
        //                 </thead>
        //                 <tbody>
        //                     {this.props.transmogSetList.map((row,i) => {
        //                         console.log(row)
        //                         return (
        //                             <tr className={row.isCollected ? 'green' : ''} key={row.setId} >
        //                                 <th scope="row">{row.setId}</th>
        //                                 <td>{row.name}</td>
        //                                 <td>{row.expansion}</td>
        //                                 <td>{row.items}</td>
        //                             </tr>
        //                         );
        //                     })}
        //                 </tbody>
        //             </table>
        //         </div>
        //     );
        // }

        return (
            <div className="Main">
                <p>Main Page</p>
                <div className="outputField">
                    {/* {output} */}
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        transmogSetList: state.transmogSetList
    }
}

export default connect(mapStateToProps)(Main);
