function getChannelEvents(channelId) {
	let channelIdToArrayOfEvents = {
		1: [],
		2: ['ARO SPONT'],
		3: [],
		4: [],
		5: [],
		6: [],
		7: [],
		8: [],
		9: [],
		10: [],
		11: [],
		12: ['Obstructive Apnea', 'Central Apnea', 'Mixed Apnea', 'Obstructive Hypopnea', 'Central Hypopnea', 'Mixed Hypopnea', 'Unsure Respiratory Event', 'Respiratory Artifact', 'Respiratory Paradox', 'Cheyne Stokes Breathing', 'RERA'],
		13: ['Obstructive Apnea', 'Central Apnea', 'Mixed Apnea', 'Obstructive Hypopnea', 'Central Hypopnea', 'Mixed Hypopnea', 'Unsure Respiratory Event', 'Respiratory Artifact', 'Respiratory Paradox', 'Cheyne Stokes Breathing', 'RERA'],
		14: ['Obstructive Apnea', 'Central Apnea', 'Mixed Apnea', 'Obstructive Hypopnea', 'Central Hypopnea', 'Mixed Hypopnea', 'Unsure Respiratory Event', 'Respiratory Artifact', 'Respiratory Paradox', 'Cheyne Stokes Breathing', 'RERA'],
		15: ['Obstructive Apnea', 'Central Apnea', 'Mixed Apnea', 'Obstructive Hypopnea', 'Central Hypopnea', 'Mixed Hypopnea', 'Unsure Respiratory Event', 'Respiratory Artifact', 'Respiratory Paradox', 'Cheyne Stokes Breathing', 'RERA'],
		16: ['SpO2 Desat', 'SpO2 Artifact'],
		17: ['Limb movement (Left)'],
		18: ['Limb movement (Right)'],
		19: [],
		20: [],
	}
	return channelIdToArrayOfEvents[channelId]
}

export default getChannelEvents