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
    try {
        const r = await client.set(key, value);
        if (r) {
            res.send({ r })
        }
        else {
            res.send({ message: "data not found" })
        }
    } catch (error) {

    }
})
app.get('/', async (req, res) => {
    const { key } = req.body;
    try {
        const data = await client.get(key);
        if (data) {
            res.send({ data: data })
        } else {
            res.send({ message: "data not found!" })
        }


    } catch (error) {
        res.send({ error: error })
    }
})

app.post('/user/:id', async (req, res) => {
    const id = req.params.id;
    const cachedUser = await client.get(`user${id}`);
    if (cachedUser && typeof (cachedUser) == 'string') {
        res.json({
            message: "user already added to redis"
        })
    }
    else {
        try {
            const response = await axios({
                url: `https://jsonplaceholder.typicode.com/users/${id}`,
                method: "get",
            });
            const user = response?.data;
            if (user) {
                const r = await client.set(`user${id}`, JSON.stringify(user))
                res.json({
                    response: r,
                    user: user,
                    message: "user added to redis"
                })
            }
            else {
                res.send({
                    message: "Data not found"
                })
            }

        } catch (error) {
            res.send({
                message: "Data not found",
                error: error
            })
        }
    }

})
app.get('/user/:id', async (req, res) => {
    const id = req.params.id;
    const cachedUser = await client.get(`user${id}`);
    if (cachedUser && typeof (cachedUser) == 'string') {
        res.json(
            {
                message: "response from redis",
                user: JSON.parse(cachedUser)
            }
        )
    }
    else {
        try {
            const response = await axios({
                url: `https://jsonplaceholder.typicode.com/users/${id}`,
                method: "get",
            });
            const user = response?.data;
            if (user) {

                const r = await client.set(`user${id}`, JSON.stringify(user))
                res.json({
                    response: r,
                    user: user
                })
            }
            else {
                res.send({ message: "data not found!" })
            }
        } catch (error) {
            res.send({
                message: "data not found!",
                error: error
            })
        }
    }

})

app.listen(5000, () => {
    console.log("server is started at port 5001");
})