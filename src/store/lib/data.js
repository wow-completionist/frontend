export const updateVisualIdHash = (fullSourceIDList) => {
    const visualIdHash = {};
    Object.values(fullSourceIDList).forEach(source => {
        if (!visualIdHash[source.visualID]) {
            visualIdHash[source.visualID] = { collected: false, sources: [source] };
        } else {
            visualIdHash[source.visualID].sources.push(source);
            visualIdHash[source.visualID].sources.sort((a,b)=> (b.name > (a.name || '')) ? 1 : -1)
        }
        if (!visualIdHash[source.visualID].collected && visualIdHash[source.visualID].sources.findIndex(item => item.isCollected) !== -1) {
            visualIdHash[source.visualID].collected = true;
        }
        if (source.isPrimary || (!visualIdHash[source.visualID].name && source.name)) {
            visualIdHash[source.visualID].name = source.name;
            visualIdHash[source.visualID].categoryID = source.categoryID;
            visualIdHash[source.visualID].qulaity = source.qulaity;
        }
    });
    return visualIdHash;
};

export const updateItemIdHash = (fullSourceIDList) => {
    const itemIdHash = {};
    Object.values(fullSourceIDList).forEach(source => {
        if (source.itemID) {
            itemIdHash[source.itemID] = source;
        }
    });
    return itemIdHash;
};
