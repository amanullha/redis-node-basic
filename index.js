const util = require("util")
const express = require("express")
const app = express()
app.use(express.json())

const redis = require("redis")
const { default: axios } = require("axios")
const { stringify } = require("querystring")
const redisUrl = "redis://127.0.0.1:6379";
const client = redis.createClient(redisUrl)

client.set = util.promisify(client.set)
client.get = util.promisify(client.get)

app.post('/', async (req, res) => {
    const { key, value } = req.body;
    const r = await client.set(key, value);
    res.send({ r })
})
app.get('/', async (req, res) => {
    const { key } = req.body;
    const data = await client.get(key);
    res.send({ data: data })
})

app.post('/user/:id', async (req, res) => {
    const id = req.params.id;
    const cachedUser = await client.get(`user${id}`);
    if (cachedUser) {
        return res.json({ message: "user already added to redis" })
    }
    else {
        const response = await axios({
            url: `https://jsonplaceholder.typicode.com/users/${id}`,
            method: "get",
        });
        const user = response?.data;
        const r = await client.set(`user${id}`, JSON.stringify(user))
        res.json({ response: r, user: user, message: "user added to redis" })
    }

})
app.get('/user/:id', async (req, res) => {
    const id = req.params.id;
    const cachedUser = await client.get(`user${id}`);
    if (cachedUser) {
        return res.json({ message: "response from redis", user: JSON.parse(cachedUser) })
    }
    else {
        const response = await axios({
            url: `https://jsonplaceholder.typicode.com/users/${id}`,
            method: "get",
        });
        const user = response?.data;

        const r = await client.set(`user${id}`, JSON.stringify(user))
        res.json({ response: r, user: user })
    }

})

app.listen(5000, () => {
    console.log("server is started at port 5001");
})