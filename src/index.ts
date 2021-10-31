// Import packages
import express, { Request, Response, Application } from 'express'
import { Article } from './models/article.model';
import axios from 'axios'
import * as dotenv from 'dotenv'
import * as cheerio from 'cheerio'

// Env variables
dotenv.config({ path: __dirname+'/.env' });

// Initialize Express inside Typescript
const app : Application = express();
// Set the server port
const PORT = process.env.PORT || 9191;

// Set an endpoint (route)
app.get("/", (req: Request, res: Response) : void => {
    //res.send("Hello Wold! This is Typescript with Node.js")
    res.json("Welcome to Climate News API")
});

const newspapers = [
    { 
        name: 'Guardian',
        base: 'https://www.theguardian.com',
        url: 'https://www.theguardian.com/environment/climate-crisis'
    },
    { 
        name: 'The Times',
        base: 'https://www.thetimes.co.uk',
        url: 'https://www.thetimes.co.uk/environment/climate-change'
    },
    { 
        name: 'Telegraph', 
        base: 'https://www.telegraph.co.uk',
        url: 'https://www.telegraph.co.uk/climate-change'
    }
]

let articles: Article[] = [];

const getNews = () => {
    articles = []
    newspapers.forEach(async (newspaper) => {
        await axios.get(newspaper.url)
        .then(response => {
            const html = response.data;
            const $ = cheerio.load(html);
    
            $('a:contains("climate")', html).each(function () {
                const title = $(this).text().trim();
                let url = $(this).attr('href');

                if(!(`${url}`.includes(newspaper.base))) {
                    url = `${newspaper.base}${$(this).attr('href')}`;
                }

                //const url = `${newspaper.base}${$(this).attr('href')}`;
                
                articles.push({ title, url, source: newspaper.name });
            });
        }).catch(err => console.error(err.message));  
    })
}

getNews();

// Route /news
app.get('/news', async (req: Request, res: Response) => {
    res.json(articles);
})

// Listen to the server port
app.listen(PORT, () : void => {
    console.log(`Server running on port ${PORT}`);
});