const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const Pool = require('pg').Pool
const port = 3000

app.use(bodyParser.json({type:"application/json"}))

app.use(bodyParser.urlencoded({extended: true}))

//config file to login to postegres database
const config = {
    host: "localhost",
    user: "parky",
    password: "Ayowale@15",
    database: "parky"
}

const pool = new Pool(config)

app.get("/hello", (req, res)=>{
    res.json("works")
})

app.get("/info", async (req, res)=>{
    try {
        const template = "SELECT * FROM campgrounds WHERE name = $1";
        const response = await pool.query(template,[req.query.q])
        if(response.rowCount == 0){
            res.json({status: "not found", searchTerm: req.query.q})
        }
        else{
            res.json({status: "ok", results: response.rows[0]})
        }
    } catch (error) {
        console.log("Error" + error)
        res.json({status:"error"})
    }
})

app.get("/near", async (req,res)=>{
    try {
        const template = "SELECT name FROM campgrounds WHERE closest_town = $1"
        const response = await pool.query(template,[req.query.city])
        if(response.rowCount == 0){
            res.json({status:"not found", searchTerm: req.query.city})
        }else{
            const camps = response.rows.map((item)=>{
                return item.name
            })
            res.json({status:"ok", result:{city:req.query.city, campgrounds: camps}})
        }
    } catch (error) {
        res.json({status:"error"})
    }
})

app.post("/add", async (req, res)=>{
    const name = req.body.name
    const town = req.body.town
    const desc = req.body.description
    const toilets = req.body.toilets
    try {
        const template = "INSERT INTO campgrounds(name, closest_town, description, restrooms) VALUES($1, $2, $3, $4)"
        const response = await pool.query(template,[name, town, desc, toilets])
        res.json({status:"ok", results: {city:town, campground: name}})

    } catch (error) {
        res.json({status:"Error! Duplicate entry", campground: name})
    }
})

app.listen(port,()=>{
    console.log(`listening on port ${port}`)
})


