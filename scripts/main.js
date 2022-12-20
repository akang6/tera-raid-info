/*
	Imported Data
*/

import raids from '../data/raids.json' assert {type: 'json'};
import types from '../data/types.json' assert {type: 'json'};
import abilities from '../data/abilities.json' assert {type: 'json'};
import moves from '../data/moves.json' assert {type: 'json'};
import herbs from '../data/herbs.json' assert {type: 'json'};


/*
	Globals
*/

const cacheVersion = 1;
const cacheName = `tera-raid-info-${cacheVersion}`;


/*
	Type Dropdown
*/

const teraTypes = {
	"Normal":1,
	"Fighting":2,
	"Flying":3,
	"Poison":4,
	"Ground":5,
	"Rock":6,
	"Bug":7,
	"Ghost":8,
	"Steel":9,
	"Fire":10,
	"Water":11,
	"Grass":12,
	"Electric":13,
	"Psychic":14,
	"Ice":15,
	"Dragon":16,
	"Dark":17,
	"Fairy":18
}


/*
	Display Creation
*/

function createTypeDiv(type) {
	return `<div class="typeText ${type.toLowerCase()}">${type}</div>`;
}

function createStatsDisplay(stats) {
	var tableString = '<div id="pokemonStats"><h3>Base Stats</h3>';
	tableString += `<div class="stat hp"><p>HP</p><p data-label="HP">${stats.hp}</p></div>`;
	tableString += `<div class="stat at"><p>Atk</p><p data-label="Atk">${stats.attack}</p></div>`;
	tableString += `<div class="stat df"><p>Def</p><p data-label="Def">${stats.defense}</p></div>`;
	tableString += `<div class="stat sa"><p>Sp.Atk</p><p data-label="Sp. Atk">${stats.spatk}</p></div>`;
	tableString += `<div class="stat sd"><p>Sp.Def</p><p data-label="Sp. Def">${stats.spdef}</p></div>`;
	tableString += `<div class="stat sp"><p>Spd</p><p data-label="Spd">${stats.speed}</p></div></div>`;
	
	return tableString;
}

function createTypeMatchupDiv(type, matchup) {
	return `<div class="typeMatchupText ${type}">${capitalize(type)} - ${matchup}x</div>`;
}

function createMoveTypeAdvantagesDisplay(matchups) {
	const display = [];
	
	Object.entries(matchups).sort((a,b) => b[1]-a[1]).forEach(([key, value]) => {
		display.push(`${capitalize(key)}`);
	});
	
	return display;
}

function createMoveDiv(move) {
	var moveStr = `<div class="typeMatchupText ${types.dex[moves.dex[move].type].name.toLowerCase()}">${moves.dex[move].name}`;
	moveStr += `<div class="moveStats">`;
	moveStr += `<div class="type">${moves.dex[move].category}</div>`;
	moveStr += `<div class="bp">Pwr: ${moves.dex[move].bp}</div>`;
	moveStr += `<div class="pp">PP: ${moves.dex[move].pp}</div>`;
	moveStr += `<div class="acc">Acc: ${moves.dex[move].acc}</div>`;
	moveStr += `<div class="desc">${moves.dex[move].desc}</div>`;
	
	if(moves.dex[move].category != 'Status') {
		var advantages = getMoveTypeAdvantages(moves.dex[move].type);
		
		if(advantages) {
			moveStr += `<div class="adv">Advantages: ${advantages}</div>`;
		}
	}
	
	moveStr += '</div></div>';
	
	return moveStr;
}

function createHerbDiv(herb) {
	return `<div class="herbPill ${herbs.dex[herb].name.toLowerCase()}">${herbs.dex[herb].name} - ${herbs.dex[herb].chance}%</div>`;
}

function createMatchupsDisplay(matchups) {
	const display = [];
	
	Object.entries(matchups).sort((a,b) => b[1]-a[1]).forEach(([key, value]) => {
		display.push(createTypeMatchupDiv(key, value));
	});
	
	return display;
}


/*
	Data Retrieval
*/

function getPokemonTypes(pokemon) {
	for(var i = 0; i < raids.pokemon[pokemon].type.length; i++) {
		$('#pokemonTypes').append(
			createTypeDiv(types.dex[raids.pokemon[pokemon].type[i]].name)
		);
	}
}

async function getPokemonImage(pokemon) {
	var normalPath = `./images/${raids.pokemon[pokemon].dex}.png`;
	var shinyPath = `./images/shiny/${raids.pokemon[pokemon].dex}.png`;
	
	$('#pokemonImageNormal').append($(`<img alt="Normal" title="Normal" src="${await getImage(normalPath)}" />`));
	$('#pokemonImageShiny').append($(`<img alt="Shiny" title="Shiny" src="${await getImage(shinyPath)}" />`));
}

function createAbilityDiv(ability) {
	return `<div class="typeMatchupText" data-info="${abilities.dex[ability - 1].desc}">${abilities.dex[ability - 1].name}</div>`;
}

function getPokemonAbility(pokemon) {
	$('#pokemonAbility').prepend('<h3>Ability:</h3>');
	
	for(var i = 0; i < raids.pokemon[pokemon].ability.length; i++) {
		$('#pokemonAbility').append(createAbilityDiv(raids.pokemon[pokemon].ability[i]));
	}
}

function getPokemonStats(pokemon) {
	$('#pokemonStatsWrapper').prepend(createStatsDisplay(raids.pokemon[pokemon].stats));
}

function getMoveTypeAdvantages(type) {
	var advantages = calculateTypeAdvantage(type);
	return createMoveTypeAdvantagesDisplay(advantages).join(', ');
}

function getPokemonMoves(pokemon) {
	$('#pokemonMoves').prepend('<h3>Moves:</h3>');
	
	for(var i = 0; i < raids.pokemon[pokemon].moves.sort().length; i++) {
		$('#pokemonMoves').append(createMoveDiv(raids.pokemon[pokemon].moves[i]));
	}
	
	if($('#teraList').val() != '') {		
		if($('#pokemonMoves').is(':contains("Tera Blast")')) {
			displayTeraTypeAdvantages($('#teraList').val());
		}
	}
}

function getPokemonHerbs(pokemon) {
	$('#pokemonHerbs').prepend('<h3>Herbs Dropped:</h3>');
	
	for(var i = 0; i < raids.pokemon[pokemon].herbs.length; i++) {
		$('#pokemonHerbs').append(createHerbDiv(raids.pokemon[pokemon].herbs[i]));
	}
}


/*
	Show Displays
*/

function displayTypesAdvantage(type) {
	var advantages = calculateTypesAdvantage(type);
	var display = createMatchupsDisplay(advantages);
	
	if(display.length > 0) {
		$('#pokemonTypeAdvantages').prepend('<h3>Type Advantages:</h3>');
		$('#pokemonTypeAdvantages').append(display.join(''));
	}
}

function displayTypeWeaknesses(type) {
	$('#pokemonTeraWeaknesses').empty();
	
	var weaknesses = calculateTypeWeakness(type);
	var display = createMatchupsDisplay(weaknesses);
	
	if(display.length > 0) {
		$('#pokemonTeraWeaknesses').prepend('<h3>Tera Weaknesses:</h3>');
		$('#pokemonTeraWeaknesses').append(display.join(''));
	}
}

function displayTeraTypeAdvantages(type) {
	$('#pokemonTeraAdvantages').empty();
	
	var advantages = calculateTypeAdvantage(type);
	var display = createMatchupsDisplay(advantages);
	
	if(display.length > 0) {
		$('#pokemonTeraAdvantages').prepend('<h3>Tera Advantages:</h3>');
		$('#pokemonTeraAdvantages').append(display.join(''));
	}
}

/*
	Calculations
*/

function calculateTypeWeakness(type) {
	let weaknesses = {};
	let defense = types.dex[type].defense;
	
	Object.entries(defense).forEach(([key, value]) => {
		switch(key) {
			case('double'):
				value.forEach(i => { weaknesses[i] ? weaknesses[i] *= 2 : weaknesses[i] = 2 });
				break;
			case('half'):
				value.forEach(i => { weaknesses[i] ? weaknesses[i] *= 0.5 : weaknesses[i] = 0.5 });
				break;
			case('zero'):
				value.forEach(i => { weaknesses[i] = 0 });
				break;
		}
	});
	
	return weaknesses;
}

function calculateTypesAdvantage(type) {
	let advantages = {};
	
	type.forEach(item => {
		let attack = types.dex[item].attack;
		
		Object.entries(attack).forEach(([key, value]) => {
			switch(key) {
				case('double'):
					value.forEach(i => { advantages[i] ? advantages[i] *= 2 : advantages[i] = 2 });
					break;
			}
		});
	});
	
	return advantages;
}

function calculateTypeAdvantage(type) {
	let advantages = {};
	let attack = types.dex[type].attack;
	
	Object.entries(attack).forEach(([key, value]) => {
		switch(key) {
			case('double'):
				value.forEach(i => { advantages[i] ? advantages[i] *= 2 : advantages[i] = 2 });
				break;
		}
	});
	
	return advantages;
}


/*
	Misc
*/

function capitalize(word) {
  return word
    .toLowerCase()
    .replace(/\w/, firstLetter => firstLetter.toUpperCase());
}


/*
	Cache Storage for Images
*/

async function getImage(url) {
	let cachedImage = await getCachedImage(cacheName, url);
	
	if (cachedImage) {
		return cachedImage;
	}
	
	const cacheStorage = await caches.open(cacheName);
	await cacheStorage.add(url);
	
	cachedImage = await getCachedImage(cacheName, url);
	return cachedImage;
}

async function getCachedImage(cacheName, url) {
	const cacheStorage = await caches.open(cacheName);
	const cachedResponse = await cacheStorage.match(url);
	
	if(!cachedResponse || !cachedResponse.ok) {
		return false;
	}
	
	return await cachedResponse.url;
}

async function deleteCache() {
	const keys = await caches.keys();
	
	for(const key of keys) {
		const ourCache = key.startsWith('tera-raid-info-');
		
		if(cacheName === key || !ourCache) {
			continue;
		}
		
		caches.delete(key);
	}
}

function cacheIcons() {
	getImage('./icons/spicy.png');
	getImage('./icons/sweet.png');
	getImage('./icons/salty.png');
	getImage('./icons/bitter.png');
	getImage('./icons/sour.png');
	getImage('./icons/favicon.ico');
}


/*
	Main workflow
*/

function populatePokemonList() {
	Object.entries(raids.pokemon).sort().forEach((pokemon) => {
		const [mon] = pokemon;

		$('#pokemonList').append($('<option>', {
			value: mon,
			text: mon
		}));
	});
}

function populateTeraTypeList() {
	Object.entries(teraTypes).sort().forEach(([key, value]) => {
		$('#teraList').append($('<option>', {
			value: value,
			text: key
		}));
	});
}

function clearPokemonData() {
	$('#pokemonTypes').empty();
	$('#pokemonImageNormal').empty();
	$('#pokemonImageShiny').empty();
	$('#pokemonAbility').empty();
	$('#pokemonStatsWrapper').empty();
	$('#pokemonMoves').empty();
	$('#pokemonHerbs').empty();
	$('#pokemonTypeAdvantages').empty();
	$('#pokemonTeraWeaknesses').empty();
	$('#pokemonTeraAdvantages').empty();
}

$(function() {
	cacheIcons();
	populatePokemonList();
	populateTeraTypeList();

	$('#pokemonList').on('change', function() {
		clearPokemonData();
		
		if ($(this).val() != '') {
			getPokemonTypes($(this).val());	
			getPokemonImage($(this).val());
			getPokemonAbility($(this).val());
			getPokemonStats($(this).val());
			getPokemonMoves($(this).val());
			getPokemonHerbs($(this).val());
			displayTypesAdvantage(raids.pokemon[$(this).val()].type);
			
			if($('#teraList').val() != '') {
				displayTypeWeaknesses($('#teraList').val());
				
				if($('#pokemonMoves').is(':contains("Tera Blast")')) {
					displayTeraTypeAdvantages($('#teraList').val());
				}
			}
		}
	});
	
	$('#teraList').on('change', function() {
		$('#pokemonTeraWeaknesses').empty();
		
		if ($(this).val() != '' && $('#pokemonList').val() != '') {
			displayTypeWeaknesses($(this).val());
		}
		
		if($('#pokemonMoves').is(':contains("Tera Blast")')) {
			displayTeraTypeAdvantages($(this).val());
		}
	});
});