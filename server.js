require("dotenv").config()
const express = require("express")
const cors = require("cors")
const axios = require('axios');

const PORT = process.env.PORT || 3001

const admin = require("firebase-admin");

var serviceAccount = {
    type: process.env.type,
    project_id: process.env.project_id,
    private_key_id: process.env.private_key_id,
    //@ts-ignore
    private_key: process.env.private_key.replace(/\\n/g, '\n'),
    client_email: process.env.client_email,
    client_id: process.env.client_id,
    auth_uri: process.env.auth_uri,
    token_uri: process.env.token_uri,
    auth_provider_x509_cert_url: process.env.auth_provider_x509_cert_url,
    client_x509_cert_url: process.env.client_x509_cert_url,
    universe_domain: process.env.universe_domain,
}

admin.initializeApp({
    //@ts-ignore
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.project_id
})

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    return res.status(200).json('initiated server connection')
})

app.post('/payment', async (req, res) => {
    const tokenResponse = await fetch('https://accept.paymob.com/api/auth/tokens', 
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "api_key": process.env.api_key
            })
        }
    )

    const tokenResponseData = await tokenResponse.json()
    
    const authToken = tokenResponseData.token
    
    const { name, description, amount_cents, quantity, email, phone_number, first_name, last_name, studentId, programId } = req.body
    
    const orderResponse = await fetch('https://accept.paymob.com/api/ecommerce/orders',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "auth_token": `${authToken}`,
            "delivery_needed": "false",
            "amount_cents": amount_cents.toString(),
            "currency": "EGP",
            "Items": [
                {
                    "name": name,
                    "description": description,
                    "amount_cents": amount_cents.toString(),
                    "quantity": quantity.toString()
                }
            ],

        })
    })

    const orderResponseData = await orderResponse.json()
    
    const orderId = orderResponseData.id

    const paymentTokenRequest = await fetch('https://accept.paymob.com/api/acceptance/payment_keys', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "auth_token": authToken,
            "amount_cents": amount_cents.toString(),
            "expiration": 3600,
            "order_id": orderId.toString(),
            "billing_data": {
                "email": email,
                "first_name": first_name,
                "last_name": last_name,
                "phone_number": phone_number,
                "country": "EG",
                "city": "cairo",
                "postal_code": "11632",
                "shipping_method": "NA",
                "street": "NA", 
                "building": "NA",
                "floor": "NA",
                "apartment": "NA",
                "state": "NA"
            },
            "currency": "EGP",
            "integration_id": Number(process.env.integration_id),
            "lock_order_when_paid": "false"
        })
    })

    const paymentTokenData = await paymentTokenRequest.json()

    const db = admin.firestore()

    const newOrder = {
        studentId,
        programId,
        orderId,
        status: 'pending'
    }

    await db.collection('orders').add(newOrder)

    return res.status(201).json({link: `https://accept.paymob.com/api/acceptance/iframes/810705?payment_token=${paymentTokenData.token}`})
})

app.post('/callback' , async (req, res) => {
    const { success } = req.body.obj
    const { id: orderId } = req.body.obj.order
    
    if(success)
    {
        const db = admin.firestore()

        const updatedOrder = {
            status: 'accepted'
        }

        await db.collection('orders').where('orderId', '==', orderId).get().then((querySnapshot) => {
            querySnapshot.docs.map((doc) => {
                db.collection('orders').doc(doc.id).update(updatedOrder)
            })
        })
    }
})

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});