const bodyParser = require('body-parser')
const express = require('express')
const axios = require('axios')

const PORT = process.env.PORT || 8080;

const Token= process.env.TOKEN;
const myToken = process.env.MYTOKEN;


const app = express().use(bodyParser.json())
app.get('/webhook',(req,res)=>{
    let mode = req.params['hub.mode']
    let challenge = req.params['hub.challenge']
    let verifyToken = req.params['hub.verify_token']

    if(mode && verifyToken){
        if(mode == 'subscribe' & verifyToken == myToken){
            res.write(200,{challenge})
        }else{
            res.status(403)
        }
    }
})
app.get('/', (req,res)=>{
    res.status(200).send("hello...")
})

app.post('/webhook', (req,res)=>{
    let body = req.body;
    console.log(JSON.stringify(body,null,2))

    let bodyValue = body.entry[0].changes[0].value;
    if(bodyValue && bodyValue.messages[0].text.body){
        let bodyMessage = bodyValue.messages[0].text.body;
        let phoneID = bodyValue.metadata.phone_number_id;
        let fromNumber = bodyValue.messages[0].from;

        axios({method:'POST',
                url:`https://graph.facebook.com/v15.0/${phoneID}/messages?access_token=${Token}`,
                data:{
                    messaging_product:"whatsapp",
                    to:`${fromNumber}`,
                    text:{
                        body:`Hi.. from the server ${bodyMessage}`
                    },
                    Headers: {"Content-Type": "application/json"}
                } })
        res.sendStatus(200)
    }else res.sendStatus(404)
})

app.listen(PORT, ()=>{console.log("Listening on port", PORT)})
