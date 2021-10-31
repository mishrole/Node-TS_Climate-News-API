// Import packages
import express, { Request, Response, Application } from 'express'
import { Article } from './models/article.model';
import axios from 'axios'
import * as dotenv from 'dotenv'
import * as cheerio from 'cheerio'
import { Newspaper } from './models/newspaper.model';
import path from 'path';

// Env variables
// TODO: Check environment variables
dotenv.config({ path: __dirname+'/.env' });

// Initialize Express inside Typescript
const app : Application = express();
// Set the server port
const PORT = process.env.PORT || 9191;

const newspapers : Newspaper[] = [
    {
        id: 1, 
        name: 'theguardian',
        base: 'https://www.theguardian.com',
        url: 'https://www.theguardian.com/environment/climate-crisis'
    },
    {
        id: 2, 
        name: 'thetimes',
        base: 'https://www.thetimes.co.uk',
        url: 'https://www.thetimes.co.uk/environment/climate-change'
    },
    {
        id: 3, 
        name: 'telegraph', 
        base: 'https://www.telegraph.co.uk',
        url: 'https://www.telegraph.co.uk/climate-change'
    },
    {
        id: 4,
        name: 'cityam',
        base: 'https://www.cityam.com',
        url: 'https://www.cityam.com/london-must-become-a-world-leader-on-climate-change-action/'
    },
    {
        id: 5,
        name: 'nytimes',
        base: 'https://www.nytimes.com',
        url: 'https://www.nytimes.com/international/section/climate'
    },
    {
        id: 6,
        name: 'latimes',
        base: 'https://www.latimes.com',
        url: 'https://www.latimes.com/environment'
    },
    {
        id: 7,
        name: 'un',
        base: 'https://www.un.org',
        url: 'https://www.un.org/climatechange'
    },
    {
        id: 8,
        name: 'bbc',
        base: 'https://www.bbc.co.uk',
        url: 'https://www.bbc.co.uk/news/science_and_environment'
    },
    {
        id: 9,
        name: 'standard',
        base: 'https://www.standard.co.uk',
        url: 'https://www.standard.co.uk/topic/climate-change'
    },
    {
        id: 10,
        name: 'thesun',
        base: 'https://www.thesun.co.uk',
        url: 'https://www.thesun.co.uk/topic/climate-change-environment/'
    },
    {
        id: 11,
        name: 'dailymail',
        base: 'https://www.dailymail.co.uk',
        url: 'https://www.dailymail.co.uk/news/climate_change_global_warming/index.html'
    },
    {
        id: 12,
        name: 'nypost',
        base: 'https://nypost.com',
        url: 'https://nypost.com/tag/climate-change/'
    },
    {
        id: 13,
        name: 'smh',
        base: 'https://www.smh.com.au',
        url: 'https://www.smh.com.au/environment/climate-change'
    }
]

let allArticles: Article[] = [];

const getNews = async (newspaper : Newspaper) => {
    return await axios.get(newspaper.url)
    .then(response => {
        let allArticles : Article[] = []
        const html = response.data;
        const $ = cheerio.load(html);

        $('a:contains("climate")', html).each(function () {
            const title = $(this).text().trim();
            let url = $(this).attr('href');

            if(!(`${url}`.includes(newspaper.base))) {
                url = `${newspaper.base}${$(this).attr('href')}`;
            }

            let article = { title, url, source: newspaper.name }

            if(!allArticles.find(item => item.title === title)) {
                allArticles.push(article);
            }
            
        });

        return allArticles
    }).catch(err => console.error(err.message)); 
}

const getAllNews = async () => {
    allArticles = []
    newspapers.forEach(async (newspaper) => {
        const result = await getNews(newspaper) || [];
        result.forEach(item => {
            allArticles.push(item)
        });
    });
}

getAllNews();

// Set routes
app.get("/", (req: Request, res: Response) : void => {
    res.sendFile(path.join(__dirname + '/index.html'))
});

app.get('/news', async (req: Request, res: Response) => {
    // How can I use this? (Request)
    // getAllNews()
    res.json(allArticles);
});

app.get('/news/:newspaperParam', async (req: Request, res: Response) => {
    const newspaperParam = req.params.newspaperParam;
    const newspaper = newspapers.filter(newspaper =>  newspaper.name === newspaperParam || newspaper.id === Number(newspaperParam))[0];

    if(newspaper) {
        const articles = await getNews(newspaper) || [];
        res.json({status: "success", data: articles, message: `${articles.length} news found`});
    } else {
        res.json({status: "error", message: `Newspaper '${newspaperParam}' not found`})
    }
});

app.get('/newspapers', async (req: Request, res: Response) => {
    res.json(newspapers);
});

// Listen to the server port
app.listen(PORT, () : void => {
    console.log(`Server running on port ${PORT}`);
});