// Import packages
import express, { Request, Response, Application } from 'express'
import * as dotenv from 'dotenv'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { Article } from './models/article.model';

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

const articles: Article[] = [];

app.get('/news', (req: Request, res: Response) => {
    axios.get("https://www.theguardian.com/environment/climate-crisis")
    .then((response) => {
        const html = response.data
        //res.json(html)
        const $ = cheerio.load(html)
        
        // Arrow function doesn't work here
        $('a:contains("climate")', html).each(function() {
            const title = $(this).text().trim()
            const url = $(this).attr('href')
            articles.push({title, url})
            
        });

        res.json(articles)
    }).catch((err) => {
        console.error(err);
    })
})

// Listen to the server port
app.listen(PORT, () : void => {
    console.log(`Server running on port ${PORT}`);
});


// function sum(num1 : number, num2 : number) {
//     return num1+ num2;
// }

// console.log(sum(9,11));