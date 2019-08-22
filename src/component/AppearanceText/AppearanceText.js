/* eslint-disable no-console */
/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';

import ReactTooltip from 'react-tooltip';
import constants from '../../constants';

import './AppearanceText.css';

const AppearanceText = (props) => {
  const {
    visualMetaForSlot,
    categoryID,
    navigateToVisualEdit,
    removeVisualFromSet,
    showEditButtons,
    showEmptySlots,
    emptyClick,
    tabIndex,
  } = props;

  if (!visualMetaForSlot || !visualMetaForSlot.visualID) {
    return (
      <div
        className="row"
        style={(showEmptySlots) ? { display: 'block' } : { display: 'none' }}
      >
        <div
          className="col-12"
          role="button"
          onClick={() => emptyClick()}
          onKeyPress={() => { }}
          tabIndex={tabIndex}
        >
          {`${constants.CATEGORY[categoryID]}:`}
        </div>
      </div>
    );
  }

  const handleKeyPress = (event) => {
    // TODO: Implement keyboard accessibility
    console.log(`Key pressed: '${event.key}'`);
  };

  const visualCollectedState = (visualMetaForSlot.isCollected ? ' collected' : '');
  let tooltip = '';
  if (visualMetaForSlot && visualMetaForSlot.sources) {
    tooltip = (
      <ReactTooltip id={`visual${visualMetaForSlot.visualID}`} place="right" type="dark" effect="float">
        {visualMetaForSlot.sources.map((source) => {
          const itemCollectedState = source.isCollected ? 'collected' : '';
          return (
            <div key={source.sourceID} className={itemCollectedState}>
              {`${source.name}(${source.itemID})`}
            </div>
          );
        })}
      </ReactTooltip>
    );
  }

  return (
    <div
      data-tip
      data-for={`visual${visualMetaForSlot.visualID}`}
      className="item-row"
    >
      {tooltip}
      <div className="row">
        <div className="col-3">
          {`${constants.CATEGORY[categoryID]}:`}
        </div>
        <div className={visualCollectedState}>
          {visualMetaForSlot.name}
        </div>
        <div style={showEditButtons ? { display: 'block' } : { display: 'none' }}>
          <button
            type="button"
            className="invisible-button"
            onClick={() => navigateToVisualEdit(visualMetaForSlot.visualID)}
            onKeyPress={handleKeyPress}
          >
            <span
              role="img"
              className="rename-appearance"
              aria-label="change appearance name"
            >
              &nbsp;⥃
            </span>
          </button>
          <button
            type="button"
            className="invisible-button"
            onClick={() => removeVisualFromSet(visualMetaForSlot.visualID)}
            onKeyPress={handleKeyPress}
          >
            <span
              role="img"
              className="rename-appearance"
              aria-label="change appearance name"
            >
              &nbsp;⊗
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

AppearanceText.propTypes = {
  showEditButtons: PropTypes.bool,
  showEmptySlots: PropTypes.bool,
  tabIndex: PropTypes.string,
  categoryID: PropTypes.string.isRequired,
  visualMetaForSlot: PropTypes.object,
  emptyClick: PropTypes.func.isRequired,
  removeVisualFromSet: PropTypes.func.isRequired,
  navigateToVisualEdit: PropTypes.func.isRequired,
};

AppearanceText.defaultProps = {
  visualMetaForSlot: null,
  tabIndex: null,
  showEditButtons: true,
  showEmptySlots: true,
};

export default AppearanceText;
