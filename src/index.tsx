import { render } from 'solid-js/web'
import { createStore, produce } from 'solid-js/store'

import './index.css'

type Block = {
	isOpen: boolean
	isMine: boolean
	x: number
	y: number
	neighborMineBlock: number
}

const rows = 10
const cols = 10
const mines = 20
const totalBlocks = rows * cols
const [blocks, setBlocks] = createStore<Block[][]>(generateBlocks(rows, cols, mines))
let openedMines = 0

function checkSuccess() {
	if (openedMines + mines === totalBlocks) {
		requestAnimationFrame(() => requestAnimationFrame(() => alert('You Win')))
	}
}

function getRandomInt(max: number) {
	return Math.floor(Math.random() * max)
}

function generateBlocks(width: number, height: number, totalMines: number) {
	const blocks = []
	for (let x = 0; x < width; x++) {
		const row: Block[] = []
		blocks.push(row)
		for (let y = 0; y < height; y++) {
			row.push({
				isMine: false,
				isOpen: false,
				x,
				y,
				neighborMineBlock: 0,
			})
		}
	}

	// chooseMines
	let remainingMines = totalMines
	while (remainingMines > 0) {
		const block = blocks[getRandomInt(width)]![getRandomInt(height)]!
		if (block.isMine) {
			continue
		}
		block.isMine = true
		remainingMines -= 1
	}

	return blocks
}

function openBlock(block: Block) {
	if (block.isOpen) {
		return
	}

	if (block.isMine) {
		requestAnimationFrame(() => requestAnimationFrame(() => alert('You Loose')))
		// return
	}

	let neighborMineBlock = 0
	for (let x = block.x - 1; x <= block.x + 1; x++) {
		for (let y = block.y - 1; y <= block.y + 1; y++) {
			const neighborBlock = blocks[x]?.[y]
			if (neighborBlock === block || neighborBlock === undefined) {
				continue
			}
			if (neighborBlock.isMine) {
				neighborMineBlock += 1
			}
		}
	}

	setBlocks(
		produce((blocks) => {
			const b = blocks[block.x]![block.y]!
			b.isOpen = true
			b.neighborMineBlock = neighborMineBlock
			openedMines += 1
			checkSuccess()

			if (!block.isMine && neighborMineBlock === 0) {
				for (let x = block.x - 1; x <= block.x + 1; x++) {
					for (let y = block.y - 1; y <= block.y + 1; y++) {
						const neighborBlock = blocks[x]?.[y]
						if (neighborBlock === block || neighborBlock === undefined) {
							continue
						}
						openBlock(neighborBlock)
					}
				}
			}
		})
	)
}

function App() {
	return (
		<div class="block-container" style={{ '--rows': rows, '--cols': cols }}>
			{blocks.map((row) =>
				row.map((block) => (
					<button
						classList={{ isOpen: block.isOpen, isMine: block.isMine }}
						onClick={() => openBlock(block)}
					>
						{block.isOpen && !block.isMine ? block.neighborMineBlock || '' : ''}
					</button>
				))
			)}
		</div>
	)
}

render(() => <App />, document.getElementById('root')!)
