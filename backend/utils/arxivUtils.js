const axios = require('axios');
const cheerio = require('cheerio');

const fetchArxivPapers = async (endTimestamp, categories) => {
    let results = [];

    const toDate = new Date().toISOString().split('T')[0];
    const fromDate = new Date(endTimestamp).toISOString().split('T')[0];
    let resumptionToken = null;

    do {
        try {
            let query = `http://export.arxiv.org/oai2?verb=ListRecords&from=${fromDate}&until=${toDate}&metadataPrefix=arXiv`;
            if (resumptionToken) query = `http://export.arxiv.org/oai2?verb=ListRecords&resumptionToken=${resumptionToken}`;
            const response = await axios.get(query);
            const parsedData = parseArxivResponse(response.data);
            results = results.concat(parsedData.records);
            resumptionToken = parsedData.resumptionToken;
            await new Promise((resolve) => setTimeout(resolve, 5000));
        } catch (error) {
            throw new Error(`Failed to fetch papers from arXiv with error: ${error}`);
        }
    } while (resumptionToken);

    const filteredResults = results.filter(paper =>
        new Date(paper.date).getTime() >= new Date(endTimestamp).getTime() &&
        (categories.length === 0 ||
        categories.some(category => paper.categories.some(paperCategory => paperCategory.startsWith(category))))
    );

    console.log(`Fetched ${results.length} papers from arXiv, with filtering it is: ${filteredResults.length}`);
    return filteredResults;
};


const parseArxivResponse = (data) => {
    const $ = cheerio.load(data, { xmlMode: true });
    const records = $('record');
    const papers = [];
    let resumptionToken = null;

    records.each((i, record) => {
        const metadata = $(record).find('metadata');
        const arxiv = metadata.find('arXiv');
        const id = arxiv.find('id').text();
        const title = arxiv.find('title').text();
        const authors = [];

        arxiv.find('author').each((i, author) => {
            const keyname = $(author).find('keyname').text();
            const forenames = $(author).find('forenames').text();
            authors.push(`${forenames} ${keyname}`);
        });

        const abstract = arxiv.find('abstract').text();
        const date = arxiv.find('created').text();
        const url = `https://arxiv.org/abs/${id}`;
        const categories = arxiv.find('categories').text().split(' ');

        papers.push({
            id,
            title,
            authors,
            abstract,
            date,
            url,
            categories,
            hidden: false,
            bookmarked: false,
        });
    });

    const resumptionTokenElement = $('resumptionToken');
    if (resumptionTokenElement.length > 0) {
        resumptionToken = resumptionTokenElement.text();
    }

    return { records: papers, resumptionToken };
};

module.exports = {
    fetchArxivPapers,
};
