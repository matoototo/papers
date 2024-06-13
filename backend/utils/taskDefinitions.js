// taskDefinitions.js
const fetchArxivPapers = require('./arxivUtils');

const fetchArxivTask = async (lastExecutionTime) => {
    const categories = ['cs.AI'];
    const papers = await fetchArxivPapers(lastExecutionTime, categories);
    return papers;
};

const processArxivTask = (papers) => {
    console.log('Processing arXiv papers:', papers.length);
};

const arxivTask = {
    fetch: fetchArxivTask,
    process: processArxivTask,
};

module.exports = {
    arxivTask,
};
