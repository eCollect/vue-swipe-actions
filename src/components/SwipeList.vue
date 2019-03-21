<template>
	<div
		class="swipeout-list"
		:class="{'swipeout--disabled': disabled}"
	>
		<swipe-out
			v-for="(item, index) in items"
			:key="_getItemKey(item, index)"
			:ref="`items`"
			:disabled="disabled"
			:threshold="threshold"
			:revealed="innerRevealed[index]"
			class="swipeout-list-item"
			@revealed="_onReveal(item, index, $event)"
			@left-revealed="$emit('leftRevealed', { index, item, close: $event.close })"
			@right-reveales="$emit('rightRevealed', { index, item, close: $event.close })"
			@closed="_onClose(item, index, $event)"
			@active="$emit('active', $event)"
		>
			<template v-if="$scopedSlots.left" v-slot:left="{ close }">
				<slot
					name="left"
					:item="item"
					:close="close"
					:index="index"
				/>
			</template>
			<template v-slot="{ close, revealRight, revealLeft }">
				<div ref="itemsContent" @click="$emit('swipeout:click', item)">
					<slot
						:item="item"
						:index="index"
						:close="close"
						:revealRight="revealRight"
						:revealLeft="revealLeft"
					/>
				</div>
			</template>
			<template v-if="$scopedSlots.right" v-slot:right="{ close }">
				<slot
					name="right"
					:item="item"
					:close="close"
					:index="index"
				/>
			</template>
		</swipe-out>
		<template v-if="!items.length">
			<slot name="empty">
				No results !
			</slot>
		</template>
	</div>
</template>
<script>
    /* eslint-disable */
	import SwipeOut from './SwipeOut';

	export default {
		name: 'vue-swipe-list',
		props: {
			items: {
				type: Array,
				required: true,
			},
			itemKey: {
				type: String,
			},
			/**
			 * @deprecated since version 2.0 - use itemKey instead
			 */
			transitionKey: {
				type: String,
			},
			threshold: {
				type: Number,
				default: 45,
			},
			revealed: {
				type: Object,
			},
			disabled: {
				type: Boolean,
				default: false,
			},
		},
		data() {
			return {
				innerRevealed: this.revealed || {},
				rev: this.items.map(() => null),
			}
		},
		watch: {
			revealed(val) {
				this.innerRevealed = val;
			},
			items(val) {
				this._emitRevealed({});
			},
		},
		methods: {
			revealRight(index) {
				if (!this.$refs.items[index])
					return;
				this.$refs.items[index].revealRight();
			},
			revealLeft(index) {
				if (!this.$refs.items[index])
					return;
				this.$refs.items[index].revealLeft();
			},
			close(index) {
				if (!this.$refs.items)
					return;

				if (index === undefined)
					return this.$refs.items.forEach(i => i.close());

				 if (!this.$refs.items[index])
					 return;

				return this.$refs.items[index].close();
			},
			isRevealed(index) {
				return this.innerRevealed[index] || false;
			},
			/**
			 * @deprecated use ```close``` instead
			 */
			closeActions(index) {
				this.close(index);
			},
			// private
			/*
			_updateRevealed(item, index, side) {
				const key = this._getItemKey(item, index);
				if (side)
					return this.$set(this.innerRevealed, key, side);
				return this.$delete(this.innerRevealed, key);
			},
			*/
			_onReveal(item, index, event) {
				this.$emit('revealed', {
					index,
					item,
					side: event.side,
					close: event.close,
				});
				this._emitRevealed({
					...this.innerRevealed,
					[index]: event.side,
				});
			},
			_onClose(item, index, event) {
				this.$emit('closed', {
					index,
					item,
				});
				const { [index]: omit, ...newRevealed } = this.innerRevealed;
				this._emitRevealed(newRevealed);
			},
			_getItemKey(item, index) {
				const keyPropery = this.itemKey || this.transitionKey;
				if (keyPropery !== undefined)
					return item[this.itemKey || this.transitionKey];
				return index;
			},
			_emitRevealed(val) {
				if (this.revealed !== undefined) {
					this.$emit('update:revealed', val)
					return;
				}
				this.innerRevealed = val;
			},
		},
		components: {
			SwipeOut,
		},
	};
</script>
