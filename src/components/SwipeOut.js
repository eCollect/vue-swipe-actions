/*
<template>
	<div
		class="swipeout"
		:class="{'swipeout--transitioning' : isTransitioning, 'swipeout--disabled': disabled}"
	>
		<div v-if="hasLeft" ref="left" class="swipeout-left">
			<slot name="left" :close="closeActions"></slot>
		</div>
		<div v-if="hasRight" ref="right" class="swipeout-right">
			<slot name="right" :close="closeActions"></slot>
		</div>
		<div
			ref="content"
			v-touch-pan.horizontal.mouse.mouseAllDir="_onPan"
			class="swipeout-content"
		>
			<div @click="t">
				<slot :revealRight="revealRight" :revealLeft="revealLeft" :close="closeActions" />
			</div>
		</div>
	</div>
</template>
<script>
	*/
import Vue from 'vue';
import touchPan from '../directives/touch-horizontal-pan';

// eslint-disable-next-line no-unused-vars
import styles from '../styles/vue-swipe-actions.css';

function translateX(x) {
	if (x === 0)
		return '';

	return `translate3d(${x}px, 0, 0)`;
}

export default Vue.extend({
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
	methods: {
		// public
		closeActions() {
			if (this._isActive)
				return;

			this._leftActionsWidth = this.$refs.left ? this.$refs.left.clientWidth : 0;
			this._rightActionsWidth = this.$refs.right ? this.$refs.right.clientWidth : 0;

			this._animateSlide(0, this._distanceSwiped());
		},
		revealLeft() {
			if (this._isActive || !this.$refs.right)
				return;

			this.closeActions();

			this._animateSlide(this._leftActionsWidth, true);
		},
		revealRight() {
			if (this._isActive || this.rightOpen || !this.$refs.right)
				return;

			this.closeActions();

			this._animateSlide(-this._rightActionsWidth, true);
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

			const shouldClose = (this._startLeft === 0 && Math.abs(newX) <= this.threshold) || (distance.x >= this.threshold && ((this._startLeft > 0 && distance.x < this._leftActionsWidth) || (this._startLeft < 0 && distance.x < this._rightActionsWidth)));

			// const shouldClose = this._startLeft === 0 ? Math.abs(newX) <= this.threshold : distance.x >= this.threshold;

			if (shouldClose)
				return this._animateSlide(0, true);

			return this._animateSlide(newX > 0 ? this._leftActionsWidth : -this._rightActionsWidth, true);
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
			requestAnimationFrame(() => {
				this.$refs.content.style.transform = translateX(to);
				this._shiftLeftActions(to);
				this._shiftRightActions(to);
			});
		},
	},
	render(h) {
		const content = [];
		const { left, right } = this.$scopedSlots;

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
				directives: left || right ? [{
					name: 'touch-pan',
					value: this._onPan,
					modifiers: {
						horizontal: true,
						mouse: true,
						mouseAllDir: true,
					},
				}] : null,
			}, this.$scopedSlots.default({
				revealLeft: this.revealLeft,
				revealRight: this.revealRight,
				close: this.closeActions,
			})),
		);

		return h('div', {
			staticClass: 'swipeout',
			class: { 'swipeout--disabled': this.disabled },
		}, content);
	},
});
