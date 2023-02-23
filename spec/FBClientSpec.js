const { Builder, By } = require('selenium-webdriver')

describe('Passwords client', function () {
  const baseUrl = 'http://localhost:5163/create'
  let driver

  describe("on '/create'", function () {
    beforeEach(async function () {
      driver = await new Builder().forBrowser('firefox').build()
      await driver.get(baseUrl)
    })

    afterEach(async function () {
      await driver.quit()
    })

    it('should accept user\'s character entry', async function () {
      const character = await driver.findElement(By.id('char'))
      const name = await driver.findElement(By.id('name'))
      const desc = await driver.findElement(By.id('desc'))
      const info = await driver.findElement(By.id('info'))
      const submit = await driver.findElement(By.id('submit'))
      const action = driver.actions({ async: true })

      await action.move({ origin: character }).click().perform()

      await name.sendKeys('Name')
      await desc.sendKeys('Description')
      await info.sendKeys('Information')

      await action.move({ origin: submit }).click().perform()

      const out = await driver.findElement(By.id('out'))
      const output = await out.getText()
      expect(output).toBe('Thank you for your contibution to Fantasy Bank!')
    })

    it('should accept user\'s ability entry', async function () {
      const ability = await driver.findElement(By.id('abil'))
      const name = await driver.findElement(By.id('name'))
      const info = await driver.findElement(By.id('info'))
      const submit = await driver.findElement(By.id('submit'))
      const action = driver.actions({ async: true })

      await action.move({ origin: ability }).click().perform()

      await name.sendKeys('Name')
      await info.sendKeys('Information')

      await action.move({ origin: submit }).click().perform()

      const out = await driver.findElement(By.id('out'))
      const output = await out.getText()
      expect(output).toBe('Thank you for your contibution to Fantasy Bank!')
    })
  })
})
