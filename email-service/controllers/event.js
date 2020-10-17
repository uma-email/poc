module.exports = {
  async create (req, res) {
    console.log('got /event api')
    res.setHeader('Content-Type', 'text/event-stream')
    res.end()
  }
}
