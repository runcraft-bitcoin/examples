const Run = require('./lib/run.0.6.43.node.js')
const bsv = require('bsv')  // bsv-1.5.6

// Load environment variables from .env file
require('dotenv').config()


async function main() {
    const run = new Run({
        purse: PRIVKEY_PURSE,
        owner: PRIVKEY_OWNER,
        trust: "*", // don't use this in production
    })

    console.log("purse address (for BSV coins): ", run.purse.address)
    console.log("owner address (for NFTs & Tokens): ", run.owner.address, "\n")

    const balance = await run.purse.balance()
    console.log("purse balance: ", balance, "sats\n")

    await run.inventory.sync()
    console.log("inventory._creations: ", run.inventory._creations)
}

// Access the environment variables
const PRIVKEY_PURSE = process.env.PRIVKEY_PURSE
const PRIVKEY_OWNER = process.env.PRIVKEY_OWNER
if (PRIVKEY_PURSE && PRIVKEY_OWNER) {
    console.log("loaded keys\n:")
    console.log("PRIVKEY_PURSE: ", PRIVKEY_PURSE.slice(0, 5) + "...")
    console.log("PRIVKEY_OWNER:", PRIVKEY_OWNER.slice(0, 5) + "...\n")
    main()
}
else {
    // create new keys and display them
    const run = new Run()
    console.log("Save to .env file:")
    console.log("PRIVKEY_PURSE=" + run.purse.privkey)
    console.log("PRIVKEY_OWNER=" + run.owner.privkey)
}

