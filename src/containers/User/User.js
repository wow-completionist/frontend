/* eslint-disable react/forbid-prop-types */
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import constants from '../../constants';
import CollectionInput from '../CollectionInput/CollectionInput';

import './User.css';  

// import axios from 'axios';

// import './Scraper.css';
// import constants from '../../constants';

const formatDate = (d) => {
  const event = new Date(d);
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return event.toLocaleString('en-US', { timeZone: tz });
};

const toonOrder = (a, b) => {
  const pointDif = b.achievementPoints - a.achievementPoints;
  if (pointDif !== 0) return pointDif;
  const levelDif = b.level - a.level;
  if (levelDif !== 0) return levelDif;
  return b.lastModified - a.lastModified;
};

const User = (props) => {
  const { userData } = props;

  // TODO: Paginate

  let output;
  
  if (userData && userData.characterData) {
    output = userData.characterData.sort(toonOrder).slice(0, 10).map((toon) => (
      <tr
        key={Math.random().toString(36).replace(/[^a-z]+/g, '')}
      >
        <th scope="col">{toon.name}</th>
        <td>{toon.realm}</td>
        <td>{constants.CLASS_ID[toon.class]}</td>
        <td>{constants.RACE_ID[toon.race]}</td>
        <td>{toon.level}</td>
        <td>{toon.achievementPoints}</td>
        <td><img src={`https://render-us.worldofwarcraft.com/character/${toon.thumbnail}`} alt="Toon Avatar" /></td>
        <td>{formatDate(toon.lastModified)}</td>
      </tr>
    ));
  }

  return (
    <div className="container User">
      <div className="User-title">
        <h1>
          User Page
        </h1>
      </div>
      <CollectionInput />
      <div>
        <h2>Toon Roster</h2>
        <table className="table table-dark">
          <thead className="thead-dark">
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Realm</th>
              <th scope="col">Class</th>
              <th scope="col">Race</th>
              <th scope="col">Level</th>
              <th scope="col">Points</th>
              <th scope="col">Thumb</th>
              <th scope="col">Last Played</th>
            </tr>
          </thead>
          <tbody>
            {output}
          </tbody>
        </table>
      </div>
    </div>
  );
};


User.propTypes = { userData: PropTypes.object.isRequired, };

// User.defaultProps = { userData: {} };

const mapStateToProps = (state) => ({
  transmogSetList: state.transmogSetList,
  userCharacterData: state.userCharacterData,
  userData: state.userData,
});

export default connect(mapStateToProps)(User);
