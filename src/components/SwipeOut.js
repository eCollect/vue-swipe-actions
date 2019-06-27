import touchPan from '../directives/touch-horizontal-pan';

// eslint-disable-next-line no-unused-vars
// import styles from '../styles/vue-swipe-actions.css';

function translateX(x) {
	if (x === 0)
		return '';

	return `translate3d(${x}px, 0, 0)`;
}

function clientWidth(ref) {
	return ref ? ref.clientWidth : 0;
}

// eslint-disable-next-line no-unused-vars
function areEqual(a, b) {
	if (!a && !b)
		return true;
	return a === b;
}

export default {
	name: 'SwipeOut',
	directives: {
		touchPan,
	},
	props: {
		threshold: {
			type: Number,
			default: 45,
		},
		revealed: {
			type: [String, Boolean],
		},
		/**
		* Is the item disabled
		*/
		disabled: {
			type: Boolean,
			default: false,
		},
	},
	watch: {
		revealed(val) {
			if (this.innerRevealed === val)
				return;
			this._reveal(val, true);
		},
	},
	data() {
		return {
			innerRevealed: this.revealed || false,
		};
	},
	methods: {
		// public
		/**
		 * @deprecated use ```close``` instead...
		 */
		closeActions() {
			this.close();
		},
		close() {
			if (this._isActive)
				return;

			this._reveal(false, true);
		},
		revealLeft() {
			if (this._isActive || !this.$refs.left)
				return;

			this._reveal('left', true);
		},
		revealRight() {
			if (this._isActive || !this.$refs.right)
				return;

			this._reveal('right', true);
		},
		// private
		_distanceSwiped() {
			const contentRect = this.$refs.content.getBoundingClientRect();
			const elementRect = this.$el.getBoundingClientRect();
			return contentRect.left - elementRect.left - this.$el.clientLeft;
		},
		_onPan(pan) {
			if (this.disabled)
				return null;

			if (pan.isFirst)
				return this._startListener(pan);

			if (!this._isActive)
				return null;

			if (pan.isFinal)
				return this._stopListener(pan);

			return this._swipeListener(pan);
		},
		_startListener({ distance }) {
			this.$el.classList.add('swipeout--no-transition');
			if (distance.y <= 5) {
				this._leftActionsWidth = this.$refs.left ? this.$refs.left.clientWidth : 0;
				this._rightActionsWidth = this.$refs.right ? this.$refs.right.clientWidth : 0;

				this._startLeft = this._distanceSwiped();
				this._isActive = true;
				this.$emit('active', true);
				clearTimeout(this._timer);
			}
		},
		_swipeListener({ offset }) {
			const newX = offset.x + this._startLeft;
			if (!this.$scopedSlots.left && newX > 0)
				return this._animateSlide(0);

			if (!this.$scopedSlots.right && newX < 0)
				return this._animateSlide(0);

			return this._animateSlide(offset.x + this._startLeft);
		},
		_stopListener({ offset, distance }) {
			this.$el.classList.remove('swipeout--no-transition');
			this._isActive = false;
			this.$emit('active', false);
			const newX = this._startLeft + offset.x;

			if ((this._startLeft === 0 && Math.abs(newX) <= this.threshold) || (distance.x >= this.threshold && ((this._startLeft > 0 && distance.x < this._leftActionsWidth) || (this._startLeft < 0 && distance.x < this._rightActionsWidth)))) // {
				return this._reveal(false);
			return this._reveal(newX > 0 ? 'left' : 'right');
		},
		_reveal(dir, recalculateWidth) {
			if (this._isActive && areEqual(this.innerRevealed, dir))
				return;

			if (dir && !this.$refs[dir])
				dir = false;

			this.innerRevealed = dir;
			this.$emit('update:revealed', dir);

			// close
			if (!dir) {
				this._animateSlide(0);
				this.$emit('closed');
				return;
			}


			// left
			if (dir === 'left' && this.$refs.left) {
				this._leftActionsWidth = recalculateWidth ? clientWidth(this.$refs.left) : this._leftActionsWidth;
				this._animateSlide(this._leftActionsWidth);
				this.$emit('revealed', { side: 'left', close: this.closeActions });
				this.$emit('leftRevealed', { close: this.closeActions });
				return;
			}

			// right
			if (dir === 'right' && this.$refs.right) {
				this._rightActionsWidth = recalculateWidth ? clientWidth(this.$refs.right) : this._rightActionsWidth;
				this._animateSlide(-this._rightActionsWidth);
				this.$emit('revealed', { side: 'right', close: this.closeActions });
				this.$emit('rightRevealed', { close: this.closeActions });
			}
		},
		// shift actions
		_shiftLeftActions(newX) {
			if (!this.$scopedSlots.left)
				return;

			if (newX < 0)
				newX = 0;

			const actions = this.$refs.left;
			const actionsWidth = this._leftActionsWidth;

			const progress = 1 - Math.min(newX / actionsWidth, 1);
			const deltaX = Math.min(newX, actionsWidth);

			const { children } = actions;
			const { length } = children;
			for (let i = 0; i < length; i++) {
				const child = children[i];
				const offsetLeft = actionsWidth - child.offsetLeft - child.offsetWidth;
				child.style.transform = translateX(deltaX + (offsetLeft * progress));

				if (length > 1)
					child.style.zIndex = `${length - i}`;
			}
		},
		_shiftRightActions(newX) {
			if (!this.$scopedSlots.right)
				return;

			if (newX > 0)
				newX = 0;

			const actions = this.$refs.right;

			const actionsWidth = this._rightActionsWidth;

			const progress = 1 + Math.max(newX / actionsWidth, -1);
			const deltaX = Math.max(newX, -actionsWidth);
			const { children } = actions;

			for (let i = 0; i < children.length; i++) {
				const child = children[i];
				child.style.transform = translateX(deltaX - (child.offsetLeft * progress));
			}
		},
		_animateSlide(to) {
			cancelAnimationFrame(this._frame);
			this._frame = requestAnimationFrame(() => {
				this.$refs.content.style.transform = translateX(to);
				this._shiftLeftActions(to);
				this._shiftRightActions(to);
			});
		},
	},
	render(h) {
		const content = [];
		const { left, right, default: defaultScope } = this.$scopedSlots;

		if (left)
			content.push(
				h('div', {
					ref: 'left',
					staticClass: 'swipeout-left',
				}, left({
					close: this.closeActions,
				})),
			);


		if (right)
			content.push(
				h('div', {
					ref: 'right',
					staticClass: 'swipeout-right',
				}, right({
					close: this.closeActions,
				})),
			);


		content.push(
			h('div', {
				ref: 'content',
				staticClass: 'swipeout-content',
				directives: !this.disabled && (left || right) ? [{
					name: 'touch-pan',
					value: this._onPan,
					modifiers: {
						horizontal: true,
						mouse: true,
						prevent: true,
						mousePrevent: true,
					},
				}] : null,
			}, defaultScope ? defaultScope({
				revealLeft: this.revealLeft,
				revealRight: this.revealRight,
				close: this.closeActions,
				revealed: this.innerRevealed,
			}) : null),
		);

		return h('div', {
			staticClass: 'swipeout',
			class: { 'swipeout--disabled': this.disabled },
		}, content);
	},
	beforeDestroy() {
		clearTimeout(this._timer);
		cancelAnimationFrame(this._frame);
	},
};
