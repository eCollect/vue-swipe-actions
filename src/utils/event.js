// adpoted from https://github.com/quasarframework/quasar/blob/dev/quasar/src/utils/event.js
export const listenOpts = {};
Object.defineProperty(listenOpts, 'passive', {
	configurable: true,
	get() {
		let passive;

		try {
			const opts = Object.defineProperty({}, 'passive', {
				// eslint-disable-next-line getter-return
				get() {
					passive = { passive: true };
				},
			});
			window.addEventListener('qtest', null, opts);
			window.removeEventListener('qtest', null, opts);
		} catch (e) {
			// do nothing
		}

		listenOpts.passive = passive;
		return passive;
	},
	set(val) {
		Object.defineProperty(this, 'passive', {
			value: val,
		});
	},
});

export function leftClick(e) {
	return e.button === 0;
}

export function position(e) {
	if (e.touches && e.touches[0])
		// eslint-disable-next-line prefer-destructuring
		e = e.touches[0];
	else if (e.changedTouches && e.changedTouches[0])
		// eslint-disable-next-line prefer-destructuring
		e = e.changedTouches[0];


	return {
		top: e.clientY,
		left: e.clientX,
	};
}

export default {
	position,
	leftClick,
	listenOpts,
};
