import { expect } from 'chai'
import 'mocha'
import fetch from 'node-fetch' // asennettava jos Node-versio ei tarjoa global fetch
import { initializeTestDb, insertTestUser, getToken } from './helper/test.js'

describe('Testing basic database functionality', () => {
  let token = null

  before(async () => {
    // Alusta tietokanta ja odota että se on valmis
    await initializeTestDb()

    // Lisää testikäyttäjä ja odota
    const testUser = { email: 'foo@foo.com', password: 'password123' }
    await insertTestUser(testUser)

    // Generoi token käyttäen samaa JWT_SECRET-muuttujaa kuin serverissä
    token = getToken(testUser.email)
  })

  it('should get all tasks', async () => {
    const response = await fetch('http://localhost:3001/')
    const data = await response.json()
    expect(response.status).to.equal(200)
    expect(data).to.be.an('array')
  })

  it('should create a new task', async () => {
    const newTask = { description: 'Test task' }
    const response = await fetch('http://localhost:3001/create', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      },
      body: JSON.stringify({ task: newTask })
    })

    const data = await response.json()
    expect(response.status).to.equal(201)
    expect(data).to.have.property('id')
    expect(data.description).to.equal(newTask.description)
  })

  it('should not create a new task without description', async () => {
    const response = await fetch('http://localhost:3001/create', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      },
      body: JSON.stringify({ task: {} })
    })
    expect(response.status).to.equal(400)
  })

  it('should delete the previously created task', async () => {
    const newTask = { description: 'To be deleted' }
    const createRes = await fetch('http://localhost:3001/create', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      },
      body: JSON.stringify({ task: newTask })
    })
    const created = await createRes.json()

    const deleteRes = await fetch(`http://localhost:3001/delete/${created.id}`, {
      method: 'delete',
      headers: {
        Authorization: token
      }
    })

    const delData = await deleteRes.json()
    expect(deleteRes.status).to.equal(200)
    expect(delData.id).to.equal(created.id)
  })
})