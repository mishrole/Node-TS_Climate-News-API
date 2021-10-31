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
        url: 'https://www.theguardian.com/environment/climate-crisis'
    },
    { 
        name: 'The Times', 
        url: 'https://www.thetimes.co.uk/environment/climate-change'
    },
    { 
        name: 'Telegraph', 
        url: 'https://www.telegraph.co.uk/climate-change/'
    }
]

const getNews = () => {
    let result = axios.get("https://www.theguardian.com/environment/climate-crisis")
    .then((response) => {
        const articles: Article[] = [];

        const html = response.data
        //res.json(html)
        const $ = cheerio.load(html)
        
        // Arrow function doesn't work here
        $('a:contains("climate")', html).each(function() {
            const title = $(this).text().trim()
            const url = $(this).attr('href')
            articles.push({title, url})
            
        });

        return articles
        //res.json(articles)

    }).catch((err) => {
        console.error(err);
    })

    return result
}

app.get('/news', async (req: Request, res: Response) => {
    const news = await getNews()
    res.json(news)
})

// Listen to the server port
app.listen(PORT, () : void => {
    console.log(`Server running on port ${PORT}`);
});