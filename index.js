const redis = require("redis");
const url = 'redis://:password@0.0.0.0:6379'
// redis[s]://[[username][:password]@][host][:port][/db-number]

const client = redis.createClient(
    {
        host: '127.0.0.1',
        port: '6379',
        //username: 'username',
        password: 'password'
    }

);

(async () => {
    client.on('error', err => console.log('Redis Client Error', err));
})();



async function test() {
    await client.connect();

    // await client.set('1212', 60, '121212');
    // const value = await client.get('key');
    // await client.HSET('key', 'field', 'value');
    // const val = await client.HGETALL('key');
    // console.log(val.field);
    const key = "user1";
    const value = "key value is aman";
    await client.setEx(key, 10, value);
    const val = await client.get(key);
    console.log(val);


    // await client.disconnect();
}
test();

async function test2() {
    let setSize = 20;

    await client.sAdd("key", "member1");
    await client.sAdd("key", "member2");

    while (setSize > 0) {
        client.sAdd("key", "member" + setSize);
        setSize -= 1;
    }

    // chain commands
    const x = await client
        .multi()
        .sCard("key")
        .sMembers("key")
        .keys("*")
        .dbSize()
        .exec(function (err, replies) {
            console.log("MULTI got " + replies.length + " replies");
            replies.forEach(function (reply, index) {
                console.log("REPLY  @ index " + index + ": " + reply.toString());
            });
        });
    console.log(x);
}
// test2();
