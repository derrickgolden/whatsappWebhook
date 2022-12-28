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
            res.status(200).send(challenge)
        }else{
            res.status(403)
        }
    }
})
app.get('/', (req,res)=>{
    res.status(200).send("hello...")
})

app.post('/webhook', (req,res)=>{
    let body_param = req.body;
    console.log(JSON.stringify(body,null,2))

    if(body_param.object){
        console.log("inside body param");
        if(body_param.entry && 
            body_param.entry[0].changes && 
            body_param.entry[0].changes[0].value.messages && 
            body_param.entry[0].changes[0].value.messages[0]  
            ){
               let phon_no_id=body_param.entry[0].changes[0].value.metadata.phone_number_id;
               let from = body_param.entry[0].changes[0].value.messages[0].from; 
               let msg_body = body_param.entry[0].changes[0].value.messages[0].text.body;

        axios({method:'POST',
                url:`https://graph.facebook.com/v15.0/${phon_no_id}/messages?access_token=${Token}`,
                data:{
                    messaging_product:"whatsapp",
                    to:`${from}`,
                    text:{
                        body:`Hi.. from the server ${msg_body}`
                    },
                    headers: {"Content-Type": "application/json"}
                } })
        res.sendStatus(200)
    }else res.sendStatus(404)
}
})

app.listen(PORT, ()=>{console.log("Listening on port", PORT)})
