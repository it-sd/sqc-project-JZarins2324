require('dotenv').config()
const { table } = require('console')
//import { Buffer } from 'node:buffer'
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5163

const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

const query = async function (sql, params) {
  let client
  let results = []
  try {
    client = await pool.connect()
    const response = await client.query(sql, params)
    if (response && response.rows) {
      results = response.rows
    }
  } catch (err) {
    console.error(err)
  }
  if (client) client.release()
  return results
}

const queryAllTypeEntries = async function (table) {
  const sql = `SELECT * FROM ${table};`
  const results = await query(sql)
  return { entries: results }
}

const queryViewEntry = async function (table, id) {
  const sql = `SELECT * FROM ${table} WHERE id = ${id};`
  const results = await query(sql)
  return results.length ? results[0] : []
}

const getServerUrl = function (req) {
  return `${req.protocol}://${req.hostname}`
}

module.exports = {
  query,
  queryAllTypeEntries,
  queryViewEntry

}

express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', async function (req, res) {
    const creator = await queryViewEntry('character', 1)
    res.render('pages/index', creator)
  })
  .get('/about', function (req, res) {
    res.render('pages/about')
  })
  .get('/health', function (req, res) {
    const result = query('SELECT id FROM character;')
    if (result.length === 0) {
      res.status(500).send('Unhealthy')
    } else {
      res.status(200).send('Healthy')
    }
  })
  .get('/list', async function (req, res) {
    const characters = await queryAllTypeEntries('character')
    const items = await queryAllTypeEntries('item')
    const abilities = await queryAllTypeEntries('ability')

    const entries = {
      characters: characters.entries,
      items: items.entries,
      abilities: abilities.entries,
      entries: [],
      table: ''
    }

    res.setHeader('Content-Security-Policy', "script-src 'self' 'unsafe-inline'")
    res.render('pages/list', entries)
  })
  .get('/list/:table', async function (req, res) {
    const entries = await queryAllTypeEntries(req.params.table)
    const data = {
      table: req.params.table,
      characters: [],
      items: [],
      abilities: [],
      entries: entries.entries
    }

    res.render('pages/list', data)
  })
  .get('/create', async function (req, res) {
    const abilities = await queryAllTypeEntries('ability')
    const entries = {
      abilities: abilities.entries
    }
    res.render('pages/create', entries)
  })
  .post('/createEntry', async function (req, res) {
    res.set({ 'Content-Type': 'application/json' })

    try {
      const client = await pool.connect()
      const name = req.body.name
      const desc = req.body.desc
      const info = req.body.info
      const ability = req.body.ability
      const table = req.body.type

      let insertSql
      if (table === 'ability') {
        insertSql = `INSERT INTO ability (name, info) 
          VALUES ('${name}', '${info}');`
      } else if (table !== 'ability') {
        insertSql = `INSERT INTO ${table} (name, descrip, info, ability) 
          VALUES ('${name}', '${desc}', '${info}', '${ability}');`
      }
      await client.query(insertSql)

      res.json({ ok: true })
      client.release()
    } catch (err) {
      console.error(err)
      res.json({error: err})
    }

  })
  .get('/view/:table/:id', async function (req, res) {
    const entData = await queryViewEntry(req.params.table, req.params.id)
    
    if (req.params.table === 'ability') {
      entData.descrip = ''
      entData.ability = ''
    } else {
      entData.ability = await queryViewEntry('ability', entData.ability)
      entData.table = req.params.table
    }

    res.setHeader('Content-Security-Policy', "script-src 'self' 'unsafe-inline'")
    res.render('pages/view', entData)
  })
  .get('/toPDF/:table/:id', async function (req, res) {
    // Declare request values
    const baseURL = 'http://api.pdflayer.com/api/convert'
    const docURL = `${getServerUrl(req)}/view/${req.params.table}/${req.params.id}`
    const key = process.env.PDF_LAYER_ACCESS_KEY
    // Combine request values
    const pdfRequest = `${baseURL}?access_key=${key}&document_url=${docURL}&test=1`

    // Display Values in terminal
    /*
    console.log("Base URL: " + baseURL)
    console.log("Access Key: " + key)
    console.log("Document URL: " + docURL + "\n")
    console.log("Example Request: http://api.pdflayer.com/api/convert?access_key=17fac7770f20e102e1728a20df1dbcda&document_url=https://en.wikipedia.org/wiki/Waddesdon_Bequest&test=1")
    console.log("PDF Request URL: " + pdfRequest)
    */

    // Make the API request
    const response = await fetch(pdfRequest, {
      method: 'POST',
      header: {
        'Content-Type': 'application/json; charset=UTF-8',
        'Accept': 'application/json'
      },
      body: JSON.stringify({})
    })
    
    const resBuff = await response.arrayBuffer()
    const buf = Buffer.from(resBuff)
    
    if (response.ok) {
      res.setHeader('Content-disposition', 'inline; filename="pdflayer.pdf"')
      res.setHeader('Content-Type', 'application/pdf')
      res.send(buf)
    } else {
      res.json({ created: false })
    }
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`))
