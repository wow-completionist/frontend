# Completionist.Guru Front End

## Reorganizing the data

I'm attempting to flatten the data. Dictionaries are easy to use but harder to maintain. This trade off might reduce the fron end's speed, but increase consistency and ease of use.

### The big list: Sources

Sources need to be as close to the in game data as possible.

Original data shape:
```
{
    "sourceType":2,
    "invType":8,
    "visualID":10062,
    "isCollected":true,
    "sourceID":18701,
    "useError":"Level 58 required to use this appearance.",
    "isHideVisual":false,
    "itemID":39176,
    "minLevel":58,
    "itemModID":0,
    "categoryID":10,
    "name":"Kilt of Deific Torment",
    "quality":3
}
```

### VisualMeta

Currently contains the data that is used to represent the collection of sources which all have the same visualID.

Possibly could be reduced to simply the sourceID which is decided to be representative.

```
{
    visualID: Number,
    categoryID: String,
    isHideVisual: Boolean,
    name: String
}
```

### TransmogSetList

An array of transmog sets as defined by site users. Should reflect both official Tier Sets and zone sets (quest drops usually grouped by name).
The set will contain a list of visualIDs for the gear that goes together.

Possibly convert from an array to a slot:visualID format.

```
{
    "setId" : "b9621eb5-aab2-4705-83e1-e07a20c03b8b",
    "name" : "Kul Tiras Questing (Stormsong Valley Recolor)",
    "group" : "Cloth",
    "expansion" : "8.0",
    "visuals" : [ 
        35996, 
        35992, 
        35997, 
        35990, 
        35995, 
        35994, 
        36665, 
        35993, 
        35991
    ],
}
```

### userData

