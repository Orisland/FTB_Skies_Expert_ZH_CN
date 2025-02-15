const hammer = 'tetra:modular_double'

const message = (event, message) => {
	event.player.sendSystemMessage(message, true)
}

const error = (event, message) => {
	event.player.sendSystemMessage({ text: '⚠ ' + message, color: 'red' }, true)
}

const success = (event, message) => {
	event.player.sendSystemMessage({ text: '✔ ' + message, color: 'green' }, true)
}

const returnBlock = (event, block) => {
	event.server.schedule(1, _ => {
		event.player.getInventory().placeItemBackInInventory(block)
	})
}

//Cancel breaking blocks in overworld unless in creative
BlockEvents.broken(event => {
	const { level, player } = event
	if (level.dimension == 'minecraft:overworld') {
		if (!player) event.cancel()
		if (!player.isCreative()) event.cancel()
	}
})

//Cancel placing blocks in overworld unless in creative
BlockEvents.placed(event => {
	const { level, player, block } = event
	if (level.dimension == 'minecraft:overworld') {
		if (!player) event.cancel()
		if (!player.isCreative()) event.cancel()
	}
})

BlockEvents.placed('minecraft:end_portal_frame', event => {
	const { level, player, block } = event

	if (level.dimension !== 'ad_astra:glacio') {
		if (!player.isCreative()) {
			error(event, '只能放置在霜原上')
			block.set('minecraft:air')
			returnBlock(event, 'minecraft:end_portal_frame')
		}
	}
})

// Deny Cryo Fuel placement when not on Glacio
BlockEvents.placed('ad_astra:cryo_freezer', event => {
	const { level, player, block } = event
	if (level.getDimension() !== 'ad_astra:glacio') {
		if (!player.isCreative()) {
			error(event, '只能放置在霜原上')
			block.set('minecraft:air')
			returnBlock(event, 'ad_astra:cryo_freezer')
		}
	}
})

BlockEvents.placed('productivebees:feeder', event => {
	const { level, player, block } = event
	if (level.getDimension().getNamespace() === 'ad_astra') {
		if (!player.isCreative()) {
			error(event, '不能放在太空中')
			block.set('minecraft:air')
			returnBlock(event, 'productivebees:feeder')
		}
	}
})

BlockEvents.rightClicked('minecraft:end_portal_frame', event => {
	const { item, hand, player } = event
	if (hand != 'MAIN_HAND') return
	if (!event.player.crouching) return
	if (item.id != 'minecraft:air') {
		return
	}
	event.block.set('minecraft:air')
	returnBlock(event, 'minecraft:end_portal_frame')
	return
})

BlockEvents.rightClicked('minecraft:dirt', event => {
	const { item, hand, player } = event
	if (hand != 'MAIN_HAND') return
	if (item.id == 'ftbskies:mycelium_spores') {
		item.count--
		message(event, '孢子开始被方块吸收')
		event.server.scheduleInTicks(2, _ => {
			event.block.set('minecraft:mycelium')
		})
	}
})

BlockEvents.rightClicked('minecraft:netherrack', event => {
	const { item, hand, player, block } = event
	if (hand != 'MAIN_HAND') return

	if (item.id == 'ftbskies:warped_nylium_spores') {
		item.count--
		message(event, '孢子开始被下界岩吸收')
		event.server.scheduleInTicks(2, _ => {
			event.block.set('minecraft:warped_nylium')
		})
	}
	if (item.id == 'ftbskies:crimson_nylium_spores') {
		item.count--
		message(event, '孢子开始被下界岩吸收')
		event.server.scheduleInTicks(2, _ => {
			event.block.set('minecraft:crimson_nylium')
		})
	}
})

// Cancel overgrowthSeed Placement
BlockEvents.rightClicked(event => {
	const { item, player, level, server, block } = event

	if (block.hasTag('botania:floating_flowers')) {
		if (item.id == 'botania:overgrowth_seed') {
			message(event, '也许我应该把它用在花朵下面的草地上')
			event.cancel()
		}
	}
})

BlockEvents.rightClicked('minecraft:cobblestone', event => {
	const { item, hand, player, block } = event
	if (hand != 'MAIN_HAND') return
	if (!player) return
})

BlockEvents.rightClicked('minecraft:gravel', event => {
	const { item, hand, player, block } = event
	if (hand != 'MAIN_HAND') return
})

BlockEvents.rightClicked('minecraft:sand', event => {
	const { item, hand, player, block } = event
	if (hand != 'MAIN_HAND') return
})

BlockEvents.rightClicked('minecraft:end_stone', event => {
	const { item, hand, player, block } = event
	if (hand != 'MAIN_HAND') return
})

//CLay bucket waterlogging
BlockEvents.rightClicked('createsifter:sifter', event => {
	const { item, hand, player, block } = event
	if (hand != 'MAIN_HAND') return
	if (item.id != 'ceramicbucket:ceramic_bucket') return

	if (item.nbt) {
		if (item.nbt.Fluid.FluidName != 'minecraft:water') return
		if (block.properties.waterlogged == 'false') {
			block.set('createsifter:sifter', { waterlogged: true })
			player.setMainHandItem('ceramicbucket:ceramic_bucket')
		}
	} else {
		if (item.id == 'ceramicbucket:ceramic_bucket' && !item.nbt) {
			if (block.properties.waterlogged == 'true') {
				block.set('createsifter:sifter', { waterlogged: false })
				player.setMainHandItem(
					Item.of(
						'ceramicbucket:ceramic_bucket',
						'{Fluid:{Amount:1000,FluidName:"minecraft:water"}}'
					)
				)
			}
		}
	}
})

//Sifter Waterlog with Bucket - Thanks to EnigmaQuip
BlockEvents.rightClicked('createsifter:sifter', event => {
	const { item, hand, player, block } = event
	if (hand != 'MAIN_HAND') return
	if (item.id == 'minecraft:water_bucket') {
		if (block.properties.waterlogged == 'false') {
			block.set('createsifter:sifter', { waterlogged: true })
			player.setMainHandItem('minecraft:bucket')
		}
	} else if (item.id == 'minecraft:bucket') {
		if (block.properties.waterlogged == 'true') {
			block.set('createsifter:sifter', { waterlogged: false })
			item.count--
			player.give('minecraft:water_bucket')
		}
	}
})

ItemEvents.pickedUp(event => {
	const { item, player } = event
	if (item.id == 'ftbskies:mana_steel_mesh' && !player.stages.has('mana_steel_mesh'))
		player.stages.add('mana_steel_mesh')
})

PlayerEvents.inventoryChanged(event => {
	const { player, item, level } = event
	if (
		level.dimension == 'minecraft:the_nether' &&
		(item.id == 'ftbskies:eye_of_legend' || item.id == 'fbtskies:eye_of_legend_end')
	) {
		swapItem(player, item.id.toString(), 'ftbskies:eye_of_legend_nether')
	} else if (
		level.dimension == 'minecraft:the_end' &&
		(item.id == 'ftbskies:eye_of_legend' || item.id == 'ftbskies:eye_of_legend_nether')
	) {
		swapItem(player, item.id.toString(), 'ftbskies:eye_of_legend_end')
	} else if (
		level.dimension != 'minecraft:the_nether' &&
		level.dimension != 'minecraft:the_end' &&
		(item.id == 'ftbskies:eye_of_legend_nether' ||
			item.id == 'ftbskies:eye_of_legend_end')
	) {
		swapItem(player, item.id.toString(), 'ftbskies:eye_of_legend')
	}
})
//easter egg
ItemEvents.rightClicked('ftbskies:easter_egg', event => {
	const { item, player, hand, level } = event
	if (hand != 'MAIN_HAND') return
	if (item.id == 'ftbskies:easter_egg') {
		item.count--
		player.tell(`${player.username}：有情况...`)

		let pos = event.entity

		event.server.scheduleInTicks(2, _ => {
			spawnEntitiesAroundBlock(level, 'minecraft:rabbit', 1, pos, 2, 2, 2)
		})
		event.server.scheduleInTicks(10, _ => {
			spawnEntitiesAroundBlock(level, 'minecraft:rabbit', 2, pos, 2, 2, 2)
			player.tell(`${player.username}：它们正在繁殖...`)
		})
		event.server.scheduleInTicks(80, _ => {
			spawnEntitiesAroundBlock(level, 'minecraft:rabbit', 4, pos, 3, 2, 3)
		})
		event.server.scheduleInTicks(160, _ => {
			player.tell(`${player.username}：层出不穷...`)
			spawnEntitiesAroundBlock(level, 'minecraft:rabbit', 8, pos, 3, 2, 3)
		})
		event.server.scheduleInTicks(240, _ => {
			player.tell(`${player.username}：太疯狂了!`)
			spawnEntitiesAroundBlock(level, 'minecraft:rabbit', 16, pos, 4, 2, 4)
		})
		event.server.scheduleInTicks(360, _ => {
			player.tell(`${player.username}：这一切会结束吗？`)
			spawnEntitiesAroundBlock(level, 'minecraft:rabbit', 32, pos, 5, 3, 5)
		})
	}
})

//Player tick handler
PlayerEvents.tick(event => {
	const { player, server, level } = event

	let pData = player.persistentData
	// pData.gameTimer = 0
	if (!pData.gameTimer) pData.gameTimer = 0

	pData.gameTimer++

	//prevents all of these update checks from happening too often
	if (pData.gameTimer % 80 != 0) return

	if (
		!player.stages.has('got_pearl') &&
		getRandomInt(1, 100) < 15 &&
		level.dimension != 'minecraft:overworld'
	) {
		try_enderman_spawn(player, level)
	}
	pData.gameTimer = 0

	// seen blaze event
	if (!player.stages.has('seen_blaze')) {
		const boundingBox = player.getBoundingBox().inflate(8, 4, 8)
		const entities = level.getEntitiesWithin(boundingBox)

		for (const entity of entities) {
			if (entity.getType() === 'minecraft:blaze') {
				success(event, '下界已解锁！')
				player.stages.add('seen_blaze')
			}
		}
	}
})

function try_enderman_spawn(player, level) {
	let playerPos = new BlockPos(player.x, player.y, player.z)
	const checkforEndermen = new Ku.Level(level).findEntitiesWithinRadius(
		'minecraft:enderman',
		playerPos,
		64
	)

	if (checkforEndermen.length < 2) {
		let tries = 0
		let spawnFound

		while (tries < 10 && !spawnFound) {
			let randomLoc = new Ku.Level(level).getRandomLocation(playerPos, 1, 8)

			let spawnCheck = checkSpawnLocation(
				player.getLevel(),
				randomLoc,
				0,
				['minecraft:air'],
				true
			)
			if (spawnCheck.okay) {
				spawnFound = { pos: randomLoc, locationInfo: spawnCheck }
			} else {
				tries++
			}
		}
		if (!spawnFound) {
			return
		}

		player.tell([
			`一个奇怪的生物似乎在 X: ${spawnFound.pos.x}, Y: ${spawnFound.pos.y}, Z: ${spawnFound.pos.z} 注视着你 `,
		])

		let entityEnderman = level.createEntity('minecraft:enderman')
		entityEnderman.setPosition(
			spawnFound.pos.x + 0.5,
			spawnFound.pos.y + 0.5,
			spawnFound.pos.z + 0.5
		)

		entityEnderman.spawn()
	}
}

BlockEvents.placed(
	[
		'ftbskies:force_infused_moon_stone',
		'ftbskies:honeyed_moon_stone',
		'ftbskies:honeyed_mars_stone',
		'ftbskies:honeyed_venus_stone',
		'mekanismgenerators:advanced_solar_generator',
	],
	event => {
		const { block } = event
		let biome = block.biomeId
		if (biome == 'ad_astra:orbit') return

		if (event.player) {
			let blockName = Text.translate(block.item.descriptionId).string
			error(event, `您只能将 ${blockName} 放在轨道空间中！`)
		}
		event.cancel()
	}
)

// liquid source explosion WIP
// ItemEvents.rightClicked("starbunclemania:source_fluid_bucket", (event) => {
//     const { player, item, target, hand } = event;
//     if (item = "starbunclemania:source_fluid_bucket") {

//         let explosion = target.block.createExplosion();

//         explosion.damagesTerrain(false);
//         explosion.destroysTerrain(false);
//         explosion.strength(5);
//         explosion.explode();
//         player.tell("Test");
//         event.cancel();
//     }
//     return;
// })
