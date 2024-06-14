const LEVEL_TEXT = [
    'Unrated',

    'Bronze V',
    'Bronze IV',
    'Bronze III',
    'Bronze II',
    'Bronze I',

    'Silver V',
    'Silver IV',
    'Silver III',
    'Silver II',
    'Silver I',

    'Gold V',
    'Gold IV',
    'Gold III',
    'Gold II',
    'Gold I',

    'Platinum V',
    'Platinum IV',
    'Platinum III',
    'Platinum II',
    'Platinum I',

    'Diamond V',
    'Diamond IV',
    'Diamond III',
    'Diamond II',
    'Diamond I',

    'Ruby V',
    'Ruby IV',
    'Ruby III',
    'Ruby II',
    'Ruby I',
]

const LEVEL_QUERY_TEXT = [
    '0',

    'b5',
    'b4',
    'b3',
    'b2',
    'b1',

    's5',
    's4',
    's3',
    's2',
    's1',

    'g5',
    'g4',
    'g3',
    'g2',
    'g1',

    'p5',
    'p4',
    'p3',
    'p2',
    'p1',

    'd5',
    'd4',
    'd3',
    'd2',
    'd1',

    'r5',
    'r4',
    'r3',
    'r2',
    'r1',
]

export const getLevelText = (level) => {
    return LEVEL_TEXT[level]
}

export const getLevelQueryText = (level) => {
    return LEVEL_QUERY_TEXT[level]
}