require('dotenv').config()
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
  .get('/create', function (req, res) {
    res.render('pages/create')
  })
  .get('/view/:table/:id', async function (req, res) {
    const entData = await queryViewEntry(req.params.table, req.params.id)
    if (req.params.table === 'ability') {
      entData.descrip = ''
    }

    res.setHeader('Content-Security-Policy', "script-src 'self' 'unsafe-inline'")
    res.render('pages/view', entData)
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`))
