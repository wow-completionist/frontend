/* eslint-disable react/forbid-prop-types */
import React from 'react';

import './Main.css';

const Main = () => {
  console.log('-- TODO: create Main page --');

  return (
    <div className="container Main">
      <h1>Main Page</h1>
    </div>
  );
};


// Main.propTypes = { MainData: PropTypes.object.isRequired, };

// Main.defaultProps = { MainData: {} };

// const mapStateToProps = state => ({
//   transmogSetList: state.transmogSetList,
//   MainCharacterData: state.MainCharacterData,
//   MainData: state.MainData,
// });

export default Main;
