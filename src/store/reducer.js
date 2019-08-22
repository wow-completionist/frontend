import * as actionTypes from './actions';
import constants from '../constants';

// import * as updateVisualMetaHash from './lib/buildVisualMetaHash';

/**
 * "source" is the information returned from WoW API C_TransmogCollection.GetSourceInfo(sourceID)
 *          which provides the item name, categoryID (slot), visualID, and isCollected.
 * 
 * "visualMeta" is the name and description of a transmog appearance item. Each appearance can be 
 *          obtained by collecting one of several source items which all share the same visualID. 
 *          These might have different names, so the name assigned to the visualMeta is what appears
 *          in the game's Appearances tab.
 */

const initialState = {
    /** sourceList - Array
     *      List of source objects scraped from WoW API
     */
    sourceList: [],

    /** sourceIDHash - Object
     *      Key: sourceID 
     *      Value: item data indexed by sourceID including user's collection data
     * 
     *      Why create a hash? SourceIds are unique identifiers, making them perfect keys. And
     *          using the sourceId, it is way easier to both look up and update a specific item,
     *          guaranteeing only one will be in the list. So since the hash will be used every
     *          time there's an update, why not keep it around and use it instead of creating
     *          it and dumping it?
     */
    sourceIDHash: {},

    /**  transmogSetList - Array
     *      List of transmog sets or unofficial outfits.
     *      Includes the set or outfit name and tracks which visualMeta goes in each slot.
     */
    transmogSetList: [],

    /** visualMetaHash - Object
     *      Key: visualID
     *      Value: visualMeta loaded from back end and constructed on front end 
     */
    visualMetaHash: {},

    /** userData - Object
     *      User info and collected sourceID list pulled from WoW API by Completionist Addon and
     *      imported into the website manually by the user.
     *      Each source returned from the API query will include the property "isCollected",
     *      which the addon uses to construct a list of collected sourceIDs.
     */
    userData: { characterData: [], collected: [] },
    userCharacterData: [], // TODO: Only use userData instead of this

    battleNetToken: null,
};

const updateVisualMetaHash = (sourceList, visualMetaHash, userCollectedSources = []) => {
    const workingVisualHash = { ...visualMetaHash };
    sourceList.forEach((source) => {
        const { visualID } = source;
        if (!visualID) {
            return;
        }
        if (!workingVisualHash[visualID]) {
            workingVisualHash[visualID] = { sources: [source] };
        } else if (!workingVisualHash[visualID].sources) {
            workingVisualHash[visualID].sources = [source];
        } else {
            const dupe = workingVisualHash[visualID]
                .sources.find(i => i.sourceID === source.sourceID);
            if (!dupe) {
                workingVisualHash[visualID].sources.push(source);
                workingVisualHash[visualID].sources.sort((a, b) => ((b.name > (a.name || '')) ? 1 : -1));
            }
        }

        if (!workingVisualHash[visualID].name && source.name) {
            workingVisualHash[visualID].name = source.name;
        }
        if (!workingVisualHash[visualID].categoryID && source.categoryID) {
            workingVisualHash[visualID].categoryID = source.categoryID;
        }
        if (!workingVisualHash[visualID].isHideVisual && source.isHideVisual) {
            workingVisualHash[visualID].isHideVisual = source.isHideVisual;
        }
        if (userCollectedSources.includes(source.sourceID)) {
            workingVisualHash[visualID].isCollected = true;
        }
    });
    
    return workingVisualHash;
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.ADD_SOURCE_DATA: {
            const workingSourceHash = { ...state.sourceIDHash };
            const { collected } = state.userData;

            const sourceList = action.data;

            sourceList.forEach((source) => {
                workingSourceHash[source.sourceID] = source;
            });

            collected.forEach((sourceID) => {
                if (workingSourceHash[sourceID]) {
                    workingSourceHash[sourceID].isCollected = true;
                }
            });

            const newSourceList = Object.values(workingSourceHash);

            const updatedVisualMetaHash = updateVisualMetaHash(
                newSourceList, 
                state.visualMetaHash, 
                collected
            );

            return {
                ...state,
                sourceList: newSourceList,
                sourceIDHash: workingSourceHash,
                visualMetaHash: updatedVisualMetaHash,
            };
        }

        case actionTypes.ADD_USER_DATA: {
            const workingSourceHash = { ...state.sourceIDHash };
            const workingUserData = Object.assign({}, state.userData);

            console.log('--> ADD_USER_DATA action.data :', action.data);
            workingUserData.collected = action.data;

            workingUserData.collected.forEach((sourceID) => {
                if (workingSourceHash[sourceID]) {
                    workingSourceHash[sourceID].isCollected = true;
                }
            });

            const updatedVisualMetaHash = updateVisualMetaHash(
                state.sourceList, 
                state.visualMetaHash, 
                workingUserData.collected
            );

            return {
                ...state,
                visualMetaHash: updatedVisualMetaHash,
                userData: workingUserData,
                sourceIDHash: workingSourceHash,
            };
        }

        case actionTypes.UPDATE_VISUAL_META_DATA: {
            const workingVisualMetaHash = { ...state.visualMetaHash };
            action.data.forEach((visualMeta) => {
                const combined = Object.assign(
                    {}, 
                    workingVisualMetaHash[visualMeta.visualID], 
                    visualMeta
                );
                workingVisualMetaHash[visualMeta.visualID] = combined;
            });

            return {
                ...state,
                visualMetaHash: workingVisualMetaHash
            };
        }

        case actionTypes.ADD_TRANSMOG_SET: {
            const workingTransmogSetList = [action.data, ...state.transmogSetList];

            return {
                ...state,
                transmogSetList: workingTransmogSetList
            };
        }

        case actionTypes.LOAD_TRANSMOG_SETS: {
            const workingVisualMetaHash = { ...state.visualMetaHash };
            const { transmogSetList } = state;
            const newSetData = action.data;

            const setHash = {};
            transmogSetList.forEach((set) => {
                setHash[set.setId] = set;
            });

            newSetData.forEach((set) => {
                setHash[set.setId] = set;
                Object.values(constants.MOG_SLOTS).forEach((slotNumber) => {
                    const visualID = set[slotNumber];
                    if (!workingVisualMetaHash[visualID]) workingVisualMetaHash[visualID] = {};
                    workingVisualMetaHash[visualID].isAssigned = true;
                });
            });

            const newSetList = Object.values(setHash);

            return {
                ...state,
                visualMetaHash: workingVisualMetaHash,
                transmogSetList: newSetList
            };
        }

        case actionTypes.ADD_VISUAL_TO_SET: {
            const workingTransmogSetList = [...state.transmogSetList];
            const workingVisualMetaHash = { ...state.visualMetaHash };
            
            const { changingSet, slot, sourceID } = action.data;

            const { visualID, name } = state.sourceIDHash[sourceID];
            
            const setIndex = workingTransmogSetList.findIndex(set => (
                set.setId === changingSet));

            workingTransmogSetList[setIndex][slot] = visualID;

            workingVisualMetaHash[visualID].name = name;
            workingVisualMetaHash[visualID].isAssigned = true;

            return {
                ...state,
                transmogSetList: workingTransmogSetList,
                visualMetaHash: workingVisualMetaHash
            };
        }

        case actionTypes.RENAME_TRANSMOG_SET: {
            const workingTransmogSetList = [...state.transmogSetList];

            const { changingSet, newName } = action.data;
            
            const setIndex = workingTransmogSetList.findIndex(set => (
                set.setId === changingSet));

            workingTransmogSetList[setIndex].name = newName;

            return {
                ...state,
                transmogSetList: workingTransmogSetList
            };
        }

        case actionTypes.REMOVE_VISUAL_FROM_SET: {
            const workingTransmogSetList = [...state.transmogSetList];
            const workingVisualMetaHash = { ...state.visualMetaHash };
            const { changingSet, slot, visualID } = action.data;

            const setIndex = workingTransmogSetList.findIndex(set => (
                set.setId === changingSet));

            workingTransmogSetList[setIndex][slot] = null;
            workingVisualMetaHash[visualID].isAssigned = false;

            return {
                ...state,
                visualMetaHash: workingVisualMetaHash,
                transmogSetList: workingTransmogSetList
            };
        }
        
        case actionTypes.ADD_STATE: {
            const stateClone = { ...state };
            stateClone[action.data.key] = action.data.value;

            return stateClone;
        }

        default:
            return state;
    }
};

export default reducer;
