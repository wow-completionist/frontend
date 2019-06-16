import React from 'react';
import ReactTooltip from 'react-tooltip'

import './AppearanceText.css';

const AppearanceText = (props) => {
    if (!props.visualIdHash) return '';

    if (!props.visualIDs || !props.categoryID) {
        console.error(`Missing data in AppearanceText: categoryID:${props.categoryID} visualIDs:${props.visualIDs}`)
        return '';
    }

    const workingSet = [];
    props.visualIDs.forEach(visualID => {
        if (props.visualIdHash[visualID]) {
            props.visualIdHash[visualID].visualID = visualID;
            workingSet.push(props.visualIdHash[visualID]);
        }
    })

    const filtered = workingSet.filter(source => source.categoryID === props.categoryID);

    if (filtered.length > 1) {
        console.log(`WARNING - Multiple Entries for ${props.slot}: ${filtered}`)
    }

    if (filtered.length === 0) return (
        <div>{props.categoryID}:</div>
    );

    const appearanceMeta = filtered[0];
    console.log('--> appearanceMeta :', appearanceMeta);

    const visualCollectedState = (appearanceMeta.collected ? " collected" : "");

    return (
        <div 
            data-tip data-for={"visual" + appearanceMeta.visualID} 
            style={{width:"auto"}}
        >
            <ReactTooltip id={"visual" + appearanceMeta.visualID} place="right" type="dark" effect="float">
                {appearanceMeta.sources.map(source => {
                    if(!source.name) props.fetchNameForItem(source.sourceID);
                    const itemCollectedState = source.isCollected ? "collected" : "";
                    return (
                        <div key={source.sourceID} className={itemCollectedState}>
                            {source.name} ({source.itemID}) {source.isCollected ? "★" : ""}
                        </div>
                    );
                })}
            </ReactTooltip>
            <div className="row">
                <div className="col-3">
                    {props.categoryID}:
                </div>
                <div className={visualCollectedState}>
                    {appearanceMeta.name} 
                </div>
                <div>
                    <span 
                        role="img" 
                        className="rename-appearance"
                        aria-label="change appearance name"
                        onClick = {() => props.handleClick(appearanceMeta.visualID)}
                    >
                        &nbsp;⚀
                    </span>
                </div>
            </div>
        </div>
    )
};

export default AppearanceText;