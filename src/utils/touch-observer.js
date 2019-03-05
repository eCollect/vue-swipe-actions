// taken from https://github.com/quasarframework/quasar/blob/dev/quasar/src/utils/touch-observer.js
export function setObserver(el, evt, ctx) {
	const { target } = evt;
	ctx.touchTargetObserver = new MutationObserver(() => {
		if (el.contains(target) === false)
			ctx.end(evt);
	});
	ctx.touchTargetObserver.observe(el, { childList: true, subtree: true });
}

export function removeObserver(ctx) {
	if (ctx.touchTargetObserver !== undefined) {
		ctx.touchTargetObserver.disconnect();
		ctx.touchTargetObserver = undefined;
	}
}
