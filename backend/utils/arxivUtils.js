const axios = require('axios');
const { JSDOM } = require('jsdom');

const fetchArxivPapers = async (endTimestamp, categories = []) => {
    let results = [];
    let start = 0;
    const perRequest = 100;
    const categoryQuery = categories.length > 0 ? `cat:${categories.join('+cat:')}` : 'all';
    do {
        try {
            const query = `http://export.arxiv.org/api/query?search_query=${categoryQuery}&sortBy=submittedDate&sortOrder=descending&max_results=${start + perRequest}&start=${start}`;
            const response = await axios.get(query);
            results = results.concat(parseArxivResponse(response.data));
            start += perRequest;
        } catch (error) {
            throw new Error('Failed to fetch papers from arXiv');
        }
    } while (results[results.length - 1] && results[results.length - 1].date >= endTimestamp);
    return results.filter(paper => paper.date >= endTimestamp);
};

const parseArxivResponse = (data) => {
    const dom = new JSDOM(data);
    const entries = dom.window.document.getElementsByTagName('entry');
    const papers = [];

    for (let entry of entries) {
        const id = entry.getElementsByTagName('id')[0].textContent.split('/').pop();
        const title = entry.getElementsByTagName('title')[0].textContent;
        const authors = Array.from(entry.getElementsByTagName('author')).map(author => author.getElementsByTagName('name')[0].textContent);
        const abstract = entry.getElementsByTagName('summary')[0].textContent;
        const date = entry.getElementsByTagName('published')[0].textContent;
        const url = entry.getElementsByTagName('id')[0].textContent;
        const categories = Array.from(entry.getElementsByTagName('category')).map(category => category.getAttribute('term'));

        papers.push({
            id,
            title,
            authors,
            abstract,
            date,
            url,
            categories,
            thumbnailUrl: 'https://placehold.co/150x212', // Placeholder thumbnail
            hidden: false,
            bookmarked: false,
        });
    }
    return papers;
};

module.exports = fetchArxivPapers;
