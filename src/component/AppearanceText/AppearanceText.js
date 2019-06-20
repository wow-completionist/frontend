/* eslint-disable no-console */
/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';

import ReactTooltip from 'react-tooltip';
import './AppearanceText.css';

const AppearanceText = (props) => {
  const {
    visualMetaForSlot,
    categoryID,
    fetchNameForItem,
    navigateToVisualEdit,
    removeVisualFromSet,
    actions,
    emptyClick,
    tabIndex,
  } = props;

 
  if (Object.keys(visualMetaForSlot).length === 0) {
    return (
      <div className="row">
        <div 
          className="col-12"
          role="button"
          onClick={() => emptyClick()}
          onKeyPress={() => { }}
          tabIndex={tabIndex}
        >
          {`${categoryID}:`}
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
          if (!source.name) fetchNameForItem(source.sourceID);
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
          {`${categoryID}:`}
        </div>
        <div className={visualCollectedState}>
          {visualMetaForSlot.name}
        </div>
        <div style={actions ? { display: 'block' } : { display: 'none' }}>
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
  actions: PropTypes.bool.isRequired,
  tabIndex: PropTypes.number.isRequired,
  categoryID: PropTypes.string.isRequired,
  visualMetaForSlot: PropTypes.object,
  emptyClick: PropTypes.func.isRequired,
  fetchNameForItem: PropTypes.func.isRequired,
  removeVisualFromSet: PropTypes.func.isRequired,
  navigateToVisualEdit: PropTypes.func.isRequired,
};

AppearanceText.defaultProps = { visualMetaForSlot: {} };

export default AppearanceText;
