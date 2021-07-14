export function defaultParameters(defaultValues, input) {
	let keys = Object.keys(defaultValues)
	let result = {}
	for (let  i = 0 ; i < keys.length; i++) {
		let key = keys[i]
		result[key] = (input[key] === undefined) ?
			defaultValues[key] : input[key]
	}
	return result
}