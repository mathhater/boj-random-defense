import { getLevelText } from './level/text.js'

const en = {}
const ko = {}

export const messages = {
    bojrdNetworkError: 'BOJ Random Defense network response was not ok.',
    solvedacNetworkError: 'Solved.ac network response was not ok.',
    noToken: 'No Token',
    wrongToken: 'Wrong Token',
    notFound: 'Not Found',
    wrongCode: 'Invalid code or expired code.',
    notYetSolved: 'Not yet solved',
    solved: 'Solved',
    sorryTooLate: 'Sorry, Too late...',
    checking: 'Checking...',
    serverSlow: (time) => `Slow (${time}ms)`,
    serverOK: (time) => `OK (${time}ms)`,
    error: "Error",
    rangeDefenseWarning: (lowLevel, highLevel) => {
        return `There are no unsolved problem between ${getLevelText(lowLevel)} and ${getLevelText(highLevel)}. Please expand the range.`
    },

    "en-US": en,
    "ko-KR": ko,
    en,
    ko
}