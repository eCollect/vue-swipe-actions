import Platform from './Platform';

export function clearSelection() {
	if (window.getSelection !== undefined) {
		const selection = window.getSelection();
		if (selection.empty !== undefined) {
			selection.empty();
		} else if (selection.removeAllRanges !== undefined) {
			selection.removeAllRanges();
			if (Platform.is.mobile !== true)
				selection.addRange(document.createRange());
		}
	} else if (document.selection !== undefined) {
		document.selection.empty();
	}
}
