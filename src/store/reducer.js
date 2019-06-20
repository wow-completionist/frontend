import * as actionTypes from './actions';
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
    /** fullSourceIDList - Object
     *      Key: sourceID 
     *      Value: source data scraped from WoW API
     */
    fullSourceIDList: {},

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

    /** collectedSources - Array
     *      The account's collected sourceID list pulled from WoW API by Completionist Addon and
     *      imported into the website manually by the user.
     *      Each source returned from the API query will include the property "isCollected",
     *      which the addon uses to construct a list of collected sourceIDs.
     */
    collectedSources: [],
};

const updateVisualMetaHash = (fullSourceIDList, visualMetaHash, userCollectedSources) => {
    const workingVisualHash = { ...visualMetaHash };
    
    Object.values(fullSourceIDList).forEach((source) => {
        const { visualID } = source;
        if (!workingVisualHash[visualID]) {
            workingVisualHash[visualID] = { sources: [source] };
        } else if (!workingVisualHash[visualID].sources) {
            workingVisualHash[visualID].sources = [source];
        } else {
            workingVisualHash[visualID].sources.push(source);
            workingVisualHash[visualID].sources.sort((a, b) => ((b.name > (a.name || '')) ? 1 : -1));
        }
        if (source.isPrimary || (!workingVisualHash[visualID].name && source.name)) {
            workingVisualHash[visualID].name = source.name;
            workingVisualHash[visualID].categoryID = source.categoryID;
            workingVisualHash[visualID].isHideVisual = source.isHideVisual;
        }
    });
    
    if (userCollectedSources.length > 0) {
        userCollectedSources.forEach((sourceID) => {
            const { visualID } = fullSourceIDList[sourceID];
            workingVisualHash[visualID].isCollected = true;
        });
    }

    return workingVisualHash;
};

const reducer = (state = initialState, action) => {
    let fullSourceIDList; 
    let visualMetaHash; 
    let transmogSetList;
    let setIndex;
    let visualIndex;

    switch (action.type) {
        case actionTypes.ADD_SCRAPED_DATA:
            // Convert scraped or loaded data to hash map
            fullSourceIDList = Object.assign({}, state.fullSourceIDList, action.data);
            // Create hash map of visualMeta
            visualMetaHash = updateVisualMetaHash(
                fullSourceIDList, 
                state.visualMetaHash, 
                state.collectedSources
            );

            return {
                ...state,
                fullSourceIDList,
                visualMetaHash,
            };

        case actionTypes.ADD_USER_DATA:
            visualMetaHash = { ...state.visualMetaHash };
            if (action.data.collected.length > 0) {
                action.data.collected.forEach((sourceID) => {
                    if (state.fullSourceIDList[sourceID]) {
                        const { visualID } = state.fullSourceIDList[sourceID];
                        visualMetaHash[visualID].isCollected = true;
                    }
                });
            }

            // Populate other user data variables here
            return {
                ...state,
                visualMetaHash,
                collectedSources: action.data.collected
            };

        case actionTypes.LOAD_VISUAL_META_DATA:
            visualMetaHash = { ...state.visualMetaHash };
            fullSourceIDList = { ...fullSourceIDList };
            action.data.forEach((visualMeta) => {
                if (!visualMetaHash[visualMeta.visualID]) {
                    visualMetaHash[visualMeta.visualID] = visualMeta;
                }
            });

            return {
                ...state,
                visualMetaHash
            };

        case actionTypes.ADD_TRANSMOG_SET:
            transmogSetList = [action.data, ...state.transmogSetList];

            return {
                ...state,
                transmogSetList
            };

        case actionTypes.LOAD_TRANSMOG_SETS:
            visualMetaHash = { ...state.visualMetaHash };

            action.data.forEach((set) => {
                set.visuals.forEach((visualID) => {
                    if (!visualMetaHash[visualID]) visualMetaHash[visualID] = {};
                    visualMetaHash[visualID].isAssigned = true;
                });
            });
            return {
                ...state,
                visualMetaHash,
                transmogSetList: action.data
            };

        case actionTypes.ADD_VISUAL_TO_SET:
            transmogSetList = [...state.transmogSetList];
            visualMetaHash = { ...state.visualMetaHash };
            
            setIndex = transmogSetList.findIndex(set => set.setId === action.data.changingSet);

            if (transmogSetList[setIndex].visuals) {
                transmogSetList[setIndex].visuals.push(action.data.visualID);
            } else {
                transmogSetList[setIndex].visuals = [action.data.visualID];
            }

            visualMetaHash[action.data.visualID].isAssigned = true;

            return {
                ...state,
                transmogSetList
            };

        case actionTypes.REMOVE_VISUAL_FROM_SET:
            transmogSetList = [...state.transmogSetList];
            visualMetaHash = { ...state.visualMetaHash };

            setIndex = transmogSetList.findIndex(set => set.setId === action.data.changingSet);
            visualIndex = transmogSetList[setIndex].visuals.findIndex(visualID => visualID === action.data.visualID);
            if (visualIndex > -1) {
                transmogSetList[setIndex].visuals.splice(visualIndex, 1);
                visualMetaHash[action.data.visualID].isAssigned = false;
            }

            return {
                ...state,
                visualMetaHash,
                transmogSetList
            };
          
        default:
            return state;
    }
};

export default reducer;
