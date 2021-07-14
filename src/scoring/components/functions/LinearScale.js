export function linearScale(x1, x2, y1, y2) {
	let m = (y2 - y1) / (x2 - x1)
	return function(x) {
		return (x - x1) * m + y1
	}
}