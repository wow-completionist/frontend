import * as actionTypes from './actions';

import {updateVisualIdHash, updateItemIdHash} from './lib/data'

const initialState = {
    fullSourceIDList: {},
    userCollection: [],
    transmogSetList: [],
    visualIdHash: {},
    itemIdHash: {},
}

const reducer = (state = initialState, action) => {
    let _fullSourceIDList, _visualIdHash, _itemIdHash;
    switch (action.type) {
        case actionTypes.ADD_SCRAPED_DATA:
            _fullSourceIDList = Object.assign({}, state.fullSourceIDList, action.data)
            _visualIdHash = updateVisualIdHash(_fullSourceIDList);
            _itemIdHash = updateItemIdHash(_fullSourceIDList);
            return {
                ...state,
                fullSourceIDList: _fullSourceIDList,
                visualIdHash: _visualIdHash,
                itemIdHash: _itemIdHash
            }

        case actionTypes.ADD_USER_COLLECTION:
            return {
                ...state,
                userCollection: action.data
            }

        case actionTypes.ADD_TRANSMOG_SET:
            const newTransmogSetList = [action.data, ...state.transmogSetList]
            return {
                ...state,
                transmogSetList: newTransmogSetList
            }

        case actionTypes.LOAD_TRANSMOG_SETS:
            return {
                ...state,
                transmogSetList: action.data
            }

        case actionTypes.ADD_VISUAL_TO_SET:
            const { changingSet, incomingVisualId } = action.data;
            const updateTransmogSetList = [...state.transmogSetList];
            const setIndex = updateTransmogSetList.findIndex(set => set.setId === changingSet);

            if (updateTransmogSetList[setIndex].visuals) {
                updateTransmogSetList[setIndex].visuals.push(incomingVisualId);
            } else {
                updateTransmogSetList[setIndex].visuals = [incomingVisualId];
            }

            return {
                ...state,
                transmogSetList: updateTransmogSetList
            }
          
        default:
            return state;
    }
}

export default reducer;
