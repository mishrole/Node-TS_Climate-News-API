// Import packages
import express, { Request, Response, Application } from 'express'
import { Article } from './models/article.model';
import axios from 'axios'
import * as dotenv from 'dotenv'
import * as cheerio from 'cheerio'
import { Newspaper } from './models/newspaper.model';

// Env variables
dotenv.config({ path: __dirname+'/.env' });

// Initialize Express inside Typescript
const app : Application = express();
// Set the server port
const PORT = process.env.PORT || 9191;

// Set an endpoint (route)
app.get("/", (req: Request, res: Response) : void => {
    res.json("Welcome to Climate News API")
});

const newspapers : Newspaper[] = [
    {
        id: 1, 
        name: 'Guardian',
        base: 'https://www.theguardian.com',
        url: 'https://www.theguardian.com/environment/climate-crisis'
    },
    {
        id: 2, 
        name: 'The Times',
        base: 'https://www.thetimes.co.uk',
        url: 'https://www.thetimes.co.uk/environment/climate-change'
    },
    {
        id: 3, 
        name: 'Telegraph', 
        base: 'https://www.telegraph.co.uk',
        url: 'https://www.telegraph.co.uk/climate-change'
    }
]

let allArticles: Article[] = [];

const getAllNews = () => {
    allArticles = []
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
                
                allArticles.push({ title, url, source: newspaper.name });
            });
        }).catch(err => console.error(err.message));  
    })
}

getAllNews();

const getNews = async (newspaper : Newspaper) => {
    return await axios.get(newspaper.url)
    .then(response => {
        let elements : Article[] = []
        const html = response.data;
        const $ = cheerio.load(html);

        $('a:contains("climate")', html).each(function () {
            const title = $(this).text().trim();
            let url = $(this).attr('href');

            if(!(`${url}`.includes(newspaper.base))) {
                url = `${newspaper.base}${$(this).attr('href')}`;
            }
            
            elements.push({ title, url, source: newspaper.name });
        });

        return elements
    }).catch(err => console.error(err.message)); 
}

// Routes
app.get('/news', (req: Request, res: Response) => {
    res.json(allArticles);
});

app.get('/news/:newspaperId', async (req: Request, res: Response) => {
    const newspaperId = req.params.newspaperId;
    const newspaper = newspapers.filter(newspaper => newspaper.id === Number(newspaperId))[0];
    if(newspaper) {
        const articles = await getNews(newspaper);
        res.json(articles);
    } else {
        res.json("Newspaper with id " + newspaperId + " not found")
    }
});

// Listen to the server port
app.listen(PORT, () : void => {
    console.log(`Server running on port ${PORT}`);
});