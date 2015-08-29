const DPF = require('./dead-package-finder')
const d = new DPF()
d.run().on('verbose', console.log).on('error', console.log).on('end', console.log)