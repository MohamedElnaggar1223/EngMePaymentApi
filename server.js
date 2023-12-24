require("dotenv").config()
const express = require("express")
const cors = require("cors")
const axios = require('axios');

const PORT = process.env.PORT || 3001

const app = express()

app.use(cors())
app.use(express.json())

app.post('/payment', async (req, res) => {
    const tokenResponse = await fetch('https://accept.paymob.com/api/auth/tokens', 
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "api_key": "ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmpiR0Z6Y3lJNklrMWxjbU5vWVc1MElpd2ljSEp2Wm1sc1pWOXdheUk2T1RRNE1qUTJMQ0p1WVcxbElqb2lNVGN3TXpRd056Z3lNQzR3TWpNNU9UZ2lmUS40TTJHbEI1Q2cxZjg5TFMxem9SQk4wSU1WOGRaNWJPMUFsZ3JQazNoQkdUQXUyQTZqSm5oMHNHYnB0UXlHN0h0YzFhRUl1bENBMkpaaDRZUmpPclJ3QQ=="
            })
        }
    )

    const tokenResponseData = await tokenResponse.json()

    console.log(tokenResponseData)
    
    // const authToken = tokenResponseData.token

    // console.log(authToken)
    
    // const { name, description, amount_cents, quantity } = req.body
    
    // const orderResponse = await fetch('https://accept.paymob.com/api/ecommerce/orders',{
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({
    //         "auth_token": `${authToken}`,
    //         "delivery_needed": "false",
    //         "amount_cents": amount_cents.toString(),
    //         "currency": "EGP",
    //         "Items": [
    //             {
    //                 "name": name,
    //                 "description": description,
    //                 "amount_cents": amount_cents.toString(),
    //                 "quantity": quantity.toString()
    //             }
    //         ],

    //     })
    // })

    // const orderResponseData = await orderResponse.json()

    // console.log(orderResponseData)
    
    // const orderId = orderResponseData.id

    // console.log(orderId)

    // return res.status(201).json('a7a')
})

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
  });