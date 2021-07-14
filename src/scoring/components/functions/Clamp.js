function clamp(val_1, val, val_2) {
	return val_2 > val_1 ? val < val_1 ? val_1 : val > val_2 ? val_2 : val : val > val_1 ? val_1 : val < val_2 ? val_2 : val
}

export default clamp