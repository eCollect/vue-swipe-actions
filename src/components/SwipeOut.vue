<template>
	<div
		v-touch-pan.horizontal.prevent.mouse.mousePrevent="_onPan"
		class="swipeout"
		:class="{'swipeout--transitioning' : isTransitioning, 'swipeout--disabled': disabled}"
	>
		<div v-if="hasLeft" ref="left" class="swipeout-left">
			<slot name="left" :close="closeActions"></slot>
		</div>
		<div v-if="hasRight" ref="right" class="swipeout-right">
			<slot name="right" :close="closeActions"></slot>
		</div>
		<div ref="content" class="swipeout-content" @click="contentClick">
			<slot :revealRight="revealRight" :revealLeft="revealLeft" :close="closeActions"></slot>
		</div>
	</div>
</template>
<script>
	import touchPan from '../directives/touch-horizontal-pan';

	/*
	function reduceSwipe(x) {
		return Math.pow(x, 0.65); // eslint-disable-line
	}
	*/

	function translateX(x) {
		if (x === 0)
			return '';

		return `translate3d(${x}px, 0, 0)`;
	}

	export default {
		name: 'SwipeItem',
		directives: {
			touchPan,
		},
		props: {
			threshold: {
				type: Number,
				default: 45,
			},
			/**
			 * Is the item disabled
			 */
			disabled: {
				type: Boolean,
				default: false,
			},
		},
		data() {
			return {
				hammer: null,
				startLeft: 0,
				isActive: false,
				isTransitioning: false,
				direction: null,
				leftOpen: false,
				rightOpen: false,
			};
		},
		computed: {
			hasLeft() {
				return 'left' in this.$slots || 'left' in this.$scopedSlots;
			},
			hasRight() {
				return 'right' in this.$slots || 'right' in this.$scopedSlots;
			},
		},
		methods: {
			// public
			closeActions() {
				if (this.isActive)
					return;

				this._leftActionsWidth = this.$refs.left ? this.$refs.left.clientWidth : 0;
				this._rightActionsWidth = this.$refs.right ? this.$refs.right.clientWidth : 0;

				this._animateSlide(0, this._distanceSwiped());
			},
			revealLeft() {
				if (this.isActive || !this.$refs.right)
					return;

				this.closeActions();

				const oldLeft = this.$refs.content.getBoundingClientRect().left;
				this._animateSlide(this._leftActionsWidth, oldLeft);
			},
			revealRight() {
				if (this.isActive || this.rightOpen || !this.$refs.right)
					return;

				this.closeActions();

				const oldLeft = this.$refs.content.getBoundingClientRect().left;
				this._animateSlide(-this._rightActionsWidth, oldLeft);
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

				if (!this.isActive)
					return null;

				if (pan.isFinal)
					return this._stopListener(pan);

				return this._swipeListener(pan);
			},
			_startListener({ offset, direction }) {
				this.isTransitioning = false;
				if (offset.y >= -5 && offset.y <= 5) {
					this._leftActionsWidth = this.$refs.left ? this.$refs.left.clientWidth : 0;
					this._rightActionsWidth = this.$refs.right ? this.$refs.right.clientWidth : 0;

					this.startLeft = this._distanceSwiped();
					this.isActive = true;
					this.$emit('active', true);

					this.direction = direction;

					this.__dir = null;
					this.__scale = 0;
				}

				this.closeActions();
			},
			_swipeListener({ offset }) {
				return this._animateSlide(offset.x + this.startLeft);
			},
			_stopListener({ offset, distance }) {
				this.isActive = false;
				this.$emit('active', false);
				const newX = this.startLeft + offset.x;

				const shouldClose = (this.startLeft === 0 && Math.abs(newX) <= this.threshold) || (distance.x >= this.threshold && ((this.startLeft > 0 && distance.x < this._leftActionsWidth) || (this.startLeft < 0 && distance.x < this._rightActionsWidth)));

				// const shouldClose = this.startLeft === 0 ? Math.abs(newX) <= this.threshold : distance.x >= this.threshold;

				if (shouldClose)
					return this._animateSlide(0, true);

				return this._animateSlide(newX > 0 ? this._leftActionsWidth : -this._rightActionsWidth, true);
			},

			// shift actions
			_shiftLeftActions(newX) {
				if (!this.hasLeft)
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
				if (!this.hasRight)
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
			_animateSlide(to, from) {
				if (from)
					this.isTransitioning = true;

				requestAnimationFrame(() => {
					this.$refs.content.style.transform = translateX(to);
					this._shiftLeftActions(to);
					this._shiftRightActions(to);
				});
			},
			_singleTap(e) {
				if (this.disabled)
					return;
				this.$emit('swipeout:click', e);
			},
			_doubleTap(e) {
				if (this.disabled)
					return;
				this.$emit('swipeout:doubleclick', e);
			},
			contentClick(e) {
				if (this.disabled)
					return;
				this.$emit('swipeout:contentclick', e);
			},
		},
	};
</script>
<style>
.swipeout {
  position: relative;
  overflow: hidden;
  display: flex;
}

.swipeout.swipeout--disabled {
  user-select: auto;
}

.swipeout .swipeout-left, .swipeout .swipeout-right {
  position: absolute;
  height: 100%;
  display: flex;
  z-index: 1;
}

.swipeout.swipeout--transitioning .swipeout-content,
.swipeout.swipeout--transitioning .swipeout-action {
	transition: transform 300ms;
}
.swipeout .swipeout-content {
	width: 100%;
}
.swipeout .swipeout-content,
.swipeout .swipeout-action {
	will-change: transform;
}

.swipeout .swipeout-left {
  left: 0;
  transform: translateX(-100%);
}

.swipeout .swipeout-right {
  right: 0;
  transform: translateX(100%);
}
.swipeout-list-item {
	outline: none;
}
</style>
