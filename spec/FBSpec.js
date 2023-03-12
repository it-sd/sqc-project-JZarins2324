const { queryAllTypeEntries, queryViewEntry } = require('../server.js')

describe('fantasy bank server', function () {
  const baseUrl = 'http://localhost:5163'
  const shouldBeBetween200and399 = async function (route) {
    it('should return 200', async function () {
      const url = new URL(route, baseUrl)
      const res = await fetch(url)
      expect(res.status).toBeGreaterThanOrEqual(200)
      expect(res.status).toBeLessThanOrEqual(399)
    }, 10000)
  }

  describe("GET '/'", function () {
    shouldBeBetween200and399('/')
  })

  describe("GET '/health'", function () {
    shouldBeBetween200and399('/health')
  })

  describe("GET '/about'", function () {
    shouldBeBetween200and399('/about')
  })

  describe("GET '/list'", function () {
    shouldBeBetween200and399('/list')
  })

  describe("GET '/list:table'", function () {
    shouldBeBetween200and399('/list/item')
  })

  describe("GET '/create'", function () {
    shouldBeBetween200and399('/create')
  })

  describe("GET '/view/:table/:id'", function () {
    shouldBeBetween200and399('/view/ability/1')
  })

  describe('queryAllTypeEntries', function () {
    it('should return an object containing an array of all entries in a table', async function () {
      const results = await queryAllTypeEntries('character')
      expect(results).toBeDefined()
      expect(results.entries).toBeDefined()
      expect(results.entries.length).toBeGreaterThan(0)
    })

    it('should return a single entry given a search parameter', async function () {
      const results = await queryAllTypeEntries('ability', 'Knowledge Transfer')
      expect(results.entries).toBeDefined()
      expect(results.entries.length).toBe(1)
    })

    it('should return the same result even if parameter does not match case', async function () {
      const results1 = await queryAllTypeEntries('ability', 'Knowledge Transfer')
      const results2 = await queryAllTypeEntries('ability', 'knowledge transfer')

      expect(results1.entries).toEqual(results2.entries)
    })
  })

  describe('queryViewEntry', function () {
    it('should return a single entry from a table based on id', async function () {
      const result = await queryViewEntry('character', 1)
      expect(result).toBeDefined()
      expect(result).toEqual({ id: 1, name: 'Jacob Zarins', descrip: 'Coolest College Student', info: 'Currently working on his Software Developer Associates Degree', image: null, ability: 1 })
    })
  })

  describe("POST '/createEntry'", function () {
    const url = new URL('/createEntry', baseUrl)
    it('should accept the user\'s entry into character table', async function () {
      const data = {
        name: 'Entry Name',
        desc: 'Entry Description',
        info: 'entry Info',
        ability: 2,
        type: 'character'
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      expect(response.ok).toBeTrue()
    })

    it('should accept the user\'s entry into ability table', async function () {
      const data = {
        name: 'Entry Name',
        desc: 'Entry Description',
        info: 'Entry Info',
        ability: 2,
        type: 'ability'
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      expect(response.ok).toBeTrue()
    })
  })
})
