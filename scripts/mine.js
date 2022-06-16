const { mineBlocks } = require("../utils/mine-blocks");

const BLOCKS = 2;
const SLEEP_AMT = 500;

async function mine() {
	await mineBlocks(BLOCKS, SLEEP_AMT);
}

mine()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
