<template>
	<div class="swipeout"
		:class="{'swipeout--transitioning' : isTransitioning, 'swipeout--disabled': disabled}">
		<div v-if="hasLeft" class="swipeout-left" ref="left">
			<slot name="left" :close="closeActions"></slot>
		</div>
		<div v-if="hasRight" class="swipeout-right" ref="right">
			<slot name="right" :close="closeActions"></slot>
		</div>
		<div class="swipeout-content" ref="content" @click="contentClick">
			<slot :revealRight="revealRight" :revealLeft="revealLeft" :close="closeActions"></slot>
		</div>
	</div>
</template>
<script>
	/* eslint-disable */
	import Hammer from 'hammerjs';

	function reduceSwipe(x) {
		return Math.pow(x, 0.65); // eslint-disable-line
	}

	function translateX(x) {
		if (x === 0)
			return '';

		return `translate3d(${x}px, 0, 0)`;
	}

	export default {
		name: 'swipe-item',
		data() {
			return {
				hammer: null,
				startLeft: 0,
				isActive: false,
				isTransitioning: false,
				direction: null,
				// hasLeft: true, //'left' in this.$slots || 'left' in this.$scopedSlots,
				// hasRight: 'right' in this.$slots,
				leftOpen: false,
				rightOpen: false,
				leftActionsWidth: 0,
				rightActionsWidth: 0,
			};
		},
		computed: {
			hasLeft() {
				return 'left' in this.$slots || 'left' in this.$scopedSlots;
			},
			hasRight() {
				return 'right' in this.$slots || 'right' in this.$scopedSlots;
			}
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
			}	
		},
		mounted() {
			if (!this.hasLeft && !this.hasRight)
				return;
			this._createHammer();
		},
		beforeDestroy() {
			if (this.hammer)
				this.hammer.destroy();
			this.hammer = null;
		},
		methods: {
			// public
			closeActions() {
				if (this.isActive)
					return;

				this._animateSlide(0, this._distanceSwiped());
				this.leftOpen = false;
				this.rightOpen = false;
				this.startLeft = 0;
			},
			revealLeft() {
				if (this.isActive)
					return;

				const oldLeft = this.$refs.content.getBoundingClientRect().left;
				this.leftOpen = true;
				this._animateSlide(this.leftActionsWidth, oldLeft);
			},
			revealRight() {
				if (this.isActive)
					return;

				const oldLeft = this.$refs.content.getBoundingClientRect().left;
				this.rightOpen = true;
				this._animateSlide(-this.rightActionsWidth, oldLeft);
			},
			// private
			_createHammer() {
				this.hammer = new Hammer.Manager(this.$el, {
					touchAction: 'pan-y',
					cssProps: {
						userSelect: '',
					},
				});

				const doubelTab = new Hammer.Tap({ event: 'doubletap', taps: 2 });
				this.hammer.add(doubelTab);

				const singleTap = new Hammer.Tap({ event: 'singletap' });
				this.hammer.add(singleTap);

				doubelTab.recognizeWith(singleTap);
				singleTap.requireFailure(doubelTab);

				const pan = new Hammer.Pan({ event: 'pan' });
				this.hammer.add(pan);

				this.hammer.on('singletap', e => this._singleTap(e));
				this.hammer.on('doubletap', e => this._doubleTap(e));

				this.hammer.get('pan').set({ threshold: 0 });
				this.hammer.on('panstart', this._startListener);
				this.hammer.on('panleft panright', this._swipeListener);
				this.hammer.on('panend', this._stopListener);
			},
			_distanceSwiped() {
				const contentRect = this.$refs.content.getBoundingClientRect();
				const elementRect = this.$el.getBoundingClientRect();
				const borderLeft = getComputedStyle(this.$el, null).getPropertyValue("border-left-width");
				return contentRect.left - elementRect.left - parseFloat(borderLeft);
			},
			_startListener(event) {
				if (this.disabled)
					return null;

				this.isTransitioning = false;
				if (event.deltaY >= -5 && event.deltaY <= 5) {
					this.leftActionsWidth = this.$refs.left ? this.$refs.left.clientWidth : 0;
					this.rightActionsWidth = this.$refs.right ? this.$refs.right.clientWidth : 0;

					this.startLeft = this._distanceSwiped();
					this.isActive = true;
					this.$emit('active', true);

					if (event.deltaX > 0)
						this.direction = 'ltr';
					if (event.deltaX < 0)
						this.direction = 'rtl';
				}

				this.closeActions();
			},
			_swipeListener(event) {
				if (!this.isActive || this.disabled)
					return null;

				const newX = this.startLeft + event.deltaX;

				// attempting to reveal the right actions after revealing the left actions
				if (this.startLeft === 0 && this.direction === 'ltr' && newX < 0)
					return this._animateSlide(-reduceSwipe(-newX));

				// attempting to reveal the left actions after revealing the right actions
				if (this.startLeft === 0 && this.direction === 'rtl' && newX > 0)
					return this._animateSlide(reduceSwipe(newX));

				// attempting to reveal the right actions after starting with the left actions revealed
				if (this.startLeft < 0 && newX > 0)
					return this._animateSlide(reduceSwipe(newX));

				// attempting to reveal the left actions after starting with the right actions revealed
				if (this.startLeft > 0 && newX < 0)
					return this._animateSlide(-reduceSwipe(-newX));

				// overswiping left-to-right
				if (newX < -this.rightActionsWidth)
					return this._animateSlide(-(this.rightActionsWidth + reduceSwipe(Math.abs(newX + this.rightActionsWidth))));

				if (newX > this.leftActionsWidth)
					return this._animateSlide(+(this.leftActionsWidth + reduceSwipe(newX - this.leftActionsWidth)));


				return this._animateSlide(newX);
			},
			_stopListener(event) {
				if (!this.isActive || this.disabled)
					return null;

				const oldLeft = this.$refs.content.getBoundingClientRect().left;
				this.isActive = false;
				this.$emit('active', false);

				// close left actions
				if (this.startLeft > 0 && event.deltaX <= -this.threshold)
					return this.closeActions(); // _animateSlide(0, oldLeft);

				// close right actions
				if (this.startLeft < 0 && event.deltaX >= this.threshold)
					return this.closeActions(); // this._animateSlide(0, oldLeft);

				const currentLeft = this.startLeft + event.deltaX;

				// reveal left actions
				if (this.startLeft === 0 && this.direction === 'ltr' && currentLeft >= this.threshold)
					return this._animateSlide(this.leftActionsWidth, oldLeft);

				// reveal right actions
				if (this.startLeft === 0 && this.direction === 'rtl' && currentLeft <= -this.threshold)
					return this._animateSlide(-this.rightActionsWidth, oldLeft);

				return this._animateSlide(this.startLeft, oldLeft);
			},
			// shift actions
			_shiftLeftActions(newX) {
				if (!this.hasLeft || newX < 0)
					return;

				const actions = this.$refs.left;
				const actionsWidth = this.leftActionsWidth;

				const progress = 1 - Math.min(newX / actionsWidth, 1);
				const deltaX = Math.min(newX, actionsWidth);

				const children = actions.children;
				const length = children.length;
				for (let i = 0; i < length; i++) {
					const child = children[i];
					const offsetLeft = actionsWidth - child.offsetLeft - child.offsetWidth;
					child.style.transform = translateX(deltaX + (offsetLeft * progress));

					if (length > 1)
						child.style.zIndex = `${length - i}`;
				}
			},
			_shiftRightActions(newX) {
				if (!this.hasRight || newX > 0)
					return;

				const actions = this.$refs.right;

				const actionsWidth = this.rightActionsWidth;

				const progress = 1 + Math.max(newX / actionsWidth, -1);
				const deltaX = Math.max(newX, -actionsWidth);
				const children = actions.children;
				
				for (let i = 0; i < children.length; i++) {
					const child = children[i];
					child.style.transform = translateX(deltaX - (child.offsetLeft * progress));
				}
			},

			_animateSlide(to, from) {
				if (from) {
					if ((to - from) === 0)
						return;
					this.isTransitioning = true;
				}

				window.requestAnimationFrame(() => {
					this.$refs.content.style.transform = translateX(to);
					this._shiftLeftActions(to, this.leftActionsWidth);
					this._shiftRightActions(to, this.rightActionsWidth);
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
  user-select: none;
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
